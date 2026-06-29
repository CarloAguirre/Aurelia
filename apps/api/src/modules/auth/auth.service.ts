import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@aurelia/contracts';
import { UserEntity } from '../users/entities/user.entity';
import { CredentialHashService } from './credential-hash.service';
import { JwtTokenService } from './jwt-token.service';
import { SessionRegistryService } from './session-registry.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
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

export interface SessionRenewRequest {
  refreshToken: string;
}

export interface AuthClientContext {
  userAgent: string | null;
  ipAddress: string | null;
}

@Injectable()
export class AuthService {
  private static readonly MAX_FAILED_ATTEMPTS = 5;

  private static readonly LOCK_MINUTES = 15;

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtTokenService: JwtTokenService,
    private readonly credentialHashService: CredentialHashService,
    private readonly sessionRegistryService: SessionRegistryService,
  ) {}

  async login(payload: LoginRequest, context: AuthClientContext): Promise<LoginResponse> {
    const email = payload?.email?.trim().toLowerCase();

    if (!email || !payload?.password) {
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

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await this.credentialHashService.matches(payload.password, user.passwordHash);

    if (!isPasswordMatch) {
      const failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const shouldLock = failedLoginAttempts >= AuthService.MAX_FAILED_ATTEMPTS;

      await this.usersRepository.update(user.id, {
        failedLoginAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + AuthService.LOCK_MINUTES * 60 * 1000)
          : null,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersRepository.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    });

    const issued = await this.sessionRegistryService.issue(user, context);
    const updatedUser = await this.findActiveUserById(user.id);

    const roles = updatedUser.userRoles?.map((userRole) => userRole.role.code) ?? [];
    const permissions = this.resolvePermissions(updatedUser);
    const isGoldFieldsUser = updatedUser.email.endsWith('@goldfields.com');
    const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`.trim();
    const companyName = updatedUser.company?.name ?? (isGoldFieldsUser ? 'Gold Fields' : null);
    const areaName = updatedUser.area?.name ?? (isGoldFieldsUser ? 'Medio Ambiente' : null);
    const token = this.jwtTokenService.sign({
      sub: updatedUser.id,
      email: updatedUser.email,
      fullName,
      roles,
      permissions,
      sid: issued.session.id,
    });

    return {
      token,
      refreshToken: issued.key,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        position: updatedUser.position,
        companyId: updatedUser.companyId,
        companyName,
        areaId: updatedUser.areaId,
        areaName,
        roles,
        permissions,
      },
    };
  }

  async renew(payload: SessionRenewRequest, context: AuthClientContext): Promise<LoginResponse> {
    const refreshToken = payload?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid session');
    }

    const issued = await this.sessionRegistryService.rotate(refreshToken, context);
    const user = await this.findActiveUserById(issued.session.userId);

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
      sid: issued.session.id,
    });

    return {
      token,
      refreshToken: issued.key,
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

  async logout(sessionId: string | undefined): Promise<void> {
    await this.sessionRegistryService.revoke(sessionId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionRegistryService.revokeAll(userId);
  }

  private async findActiveUserById(id: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id, isActive: true },
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
      throw new UnauthorizedException('Invalid session');
    }

    return user;
  }

  private resolvePermissions(user: UserEntity): string[] {
    const permissions = user.userRoles?.flatMap((userRole) => (
      userRole.role.rolePermissions?.map((rolePermission) => rolePermission.permission.code) ?? []
    )) ?? [];

    return Array.from(new Set(permissions)).sort();
  }
}
