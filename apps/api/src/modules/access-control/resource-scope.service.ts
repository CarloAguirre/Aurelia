import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AccessTokenPayload } from '../auth/jwt-token.service';
import { UserEntity } from '../users/entities/user.entity';

export interface ScopedResource {
  companyId?: string | null;
  areaId?: string | null;
}

interface ScopedCompany {
  code: string | null;
  name: string;
  isContractor: boolean;
}

interface UserScope {
  isAdmin: boolean;
  isPrincipalCompanyUser: boolean;
  companyIds: Set<string>;
  areaIds: Set<string>;
}

interface AccessOptions {
  ignoreCompanyScope?: boolean;
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
    return this.isAllowed(scope, resource);
  }

  async canAccessInspection(user: AccessTokenPayload, resource: ScopedResource): Promise<boolean> {
    const scope = await this.getUserScope(user);
    return this.isAllowed(scope, resource, { ignoreCompanyScope: scope.isPrincipalCompanyUser });
  }

  async filterAllowed<T extends ScopedResource>(user: AccessTokenPayload, resources: T[]): Promise<T[]> {
    const scope = await this.getUserScope(user);
    return resources.filter((resource) => this.isAllowed(scope, resource));
  }

  async filterAllowedInspections<T extends ScopedResource>(user: AccessTokenPayload, resources: T[]): Promise<T[]> {
    const scope = await this.getUserScope(user);
    return resources.filter((resource) => this.isAllowed(scope, resource, { ignoreCompanyScope: scope.isPrincipalCompanyUser }));
  }

  private isAllowed(scope: UserScope, resource: ScopedResource, options: AccessOptions = {}): boolean {
    if (scope.isAdmin) return true;
    if (!options.ignoreCompanyScope && resource.companyId && scope.companyIds.size > 0 && !scope.companyIds.has(resource.companyId)) return false;
    if (resource.areaId && scope.areaIds.size > 0 && !scope.areaIds.has(resource.areaId)) return false;
    return true;
  }

  private async getUserScope(user: AccessTokenPayload): Promise<UserScope> {
    const isAdmin = user.roles.includes('ADMIN');
    const row = await this.users.findOne({
      where: { id: user.sub, isActive: true },
      relations: {
        company: true,
        userCompanies: {
          company: true,
        },
        userAreas: {
          area: true,
        },
      },
    });

    const companyIds = new Set<string>();
    const areaIds = new Set<string>();
    const companies = [row?.company, ...(row?.userCompanies ?? []).map((userCompany) => userCompany.company)].filter(
      (company): company is ScopedCompany => Boolean(company),
    );

    if (row?.companyId) companyIds.add(row.companyId);
    for (const userCompany of row?.userCompanies ?? []) companyIds.add(userCompany.company.id);
    if (row?.areaId) areaIds.add(row.areaId);
    for (const userArea of row?.userAreas ?? []) areaIds.add(userArea.area.id);

    return {
      isAdmin,
      isPrincipalCompanyUser: companies.some((company) => this.isPrincipalCompany(company)) || user.email.toLowerCase().endsWith('@goldfields.com'),
      companyIds,
      areaIds,
    };
  }

  private isPrincipalCompany(company: ScopedCompany): boolean {
    const code = company.code?.trim().toUpperCase() ?? '';
    const name = company.name.trim().toLowerCase();
    return code === 'CORP' || company.isContractor === false || name.includes('gold field');
  }
}
