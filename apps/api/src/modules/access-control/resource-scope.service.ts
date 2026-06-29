import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AccessTokenPayload } from '../auth/jwt-token.service';
import { UserEntity } from '../users/entities/user.entity';

export interface ScopedResource {
  companyId?: string | null;
  areaId?: string | null;
}

interface UserScope {
  isAdmin: boolean;
  companyIds: Set<string>;
  areaIds: Set<string>;
}

@Injectable()
export class ResourceScopeService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async assertCanAccess(user: AccessTokenPayload, resource: ScopedResource): Promise<void> {
    const allowed = await this.canAccess(user, resource);
    if (!allowed) throw new Error('Forbidden resource scope');
  }

  async canAccess(user: AccessTokenPayload, resource: ScopedResource): Promise<boolean> {
    const scope = await this.getUserScope(user);
    if (scope.isAdmin) return true;
    if (resource.companyId && scope.companyIds.size > 0 && !scope.companyIds.has(resource.companyId)) return false;
    if (resource.areaId && scope.areaIds.size > 0 && !scope.areaIds.has(resource.areaId)) return false;
    return true;
  }

  async filterAllowed<T extends ScopedResource>(user: AccessTokenPayload, resources: T[]): Promise<T[]> {
    const scope = await this.getUserScope(user);
    if (scope.isAdmin) return resources;
    return resources.filter((resource) => {
      if (resource.companyId && scope.companyIds.size > 0 && !scope.companyIds.has(resource.companyId)) return false;
      if (resource.areaId && scope.areaIds.size > 0 && !scope.areaIds.has(resource.areaId)) return false;
      return true;
    });
  }

  private async getUserScope(user: AccessTokenPayload): Promise<UserScope> {
    const isAdmin = user.roles.includes('ADMIN');
    const row = await this.users.findOne({
      where: { id: user.sub, isActive: true },
      relations: {
        userCompanies: true,
        userAreas: true,
      },
    });

    const companyIds = new Set<string>();
    const areaIds = new Set<string>();

    if (row?.companyId) companyIds.add(row.companyId);
    for (const userCompany of row?.userCompanies ?? []) companyIds.add(userCompany.companyId);
    if (row?.areaId) areaIds.add(row.areaId);
    for (const userArea of row?.userAreas ?? []) areaIds.add(userArea.areaId);

    return { isAdmin, companyIds, areaIds };
  }
}
