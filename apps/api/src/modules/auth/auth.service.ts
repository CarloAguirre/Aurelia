import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@aurelia/contracts';
import { UserEntity } from '../users/entities/user.entity';
import { JwtTokenService } from './jwt-token.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    firstName: string;
    lastName: string;
    position: string | null;
    companyId: string | null;
    companyName: string | null;
    areaId: string | null;
    areaName: string | null;
    roles: Role[];
    permissions: string[];
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtTokenService: JwtTokenService,
    private readonly config: ConfigService,
  ) {}

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const email = payload?.email?.trim().toLowerCase();
    const loginPassword = this.config.get<string>('auth.loginPassword');

    if (!email || !payload?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!loginPassword) {
      throw new InternalServerErrorException('API login password is not configured');
    }

    if (payload.password !== loginPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersRepository.findOne({
      where: { email, isActive: true },
      relations: {
        company: true,
        area: true,
        userRoles: {
          role: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    const roles = user.userRoles?.map((userRole) => userRole.role.code) ?? [];
    const permissions = this.resolvePermissions(user);
    const isGoldFieldsUser = user.email.endsWith('@goldfields.com');
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const companyName = user.company?.name ?? (isGoldFieldsUser ? 'Gold Fields' : null);
    const areaName = user.area?.name ?? (isGoldFieldsUser ? 'Medio Ambiente' : null);
    const token = this.jwtTokenService.sign({
      sub: user.id,
      email: user.email,
      fullName,
      roles,
      permissions,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        companyId: user.companyId,
        companyName,
        areaId: user.areaId,
        areaName,
        roles,
        permissions,
      },
    };
  }

  private resolvePermissions(user: UserEntity): string[] {
    const permissions = user.userRoles?.flatMap((userRole) => (
      userRole.role.rolePermissions?.map((rolePermission) => rolePermission.permission.code) ?? []
    )) ?? [];

    return Array.from(new Set(permissions)).sort();
  }
}
