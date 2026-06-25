import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@aurelia/contracts';
import { UserEntity } from '../users/entities/user.entity';

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
  ) {}

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const password = process.env.DEMO_LOGIN_PASSWORD ?? 'Aurelia2026!';
    if (payload.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersRepository.findOne({
      where: { email: payload.email.toLowerCase(), isActive: true },
      relations: {
        company: true,
        area: true,
        userRoles: { role: true },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    const roles = user.userRoles?.map((userRole) => userRole.role.code) ?? [];
    const isGoldFieldsUser = user.email.endsWith('@goldfields.com');

    return {
      token: `demo-token-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        companyId: user.companyId,
        companyName: user.company?.name ?? (isGoldFieldsUser ? 'Gold Fields' : null),
        areaId: user.areaId,
        areaName: user.area?.name ?? (isGoldFieldsUser ? 'Medio Ambiente' : null),
        roles,
        permissions: roles.includes(Role.ADMIN) ? ['*'] : ['inspections:create', 'inspections:read'],
      },
    };
  }
}
