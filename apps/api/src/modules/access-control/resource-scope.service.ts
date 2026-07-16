import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { InspectionAssignmentScopeResponse } from '@aurelia/contracts';
import { Repository } from 'typeorm';
import type { AccessTokenPayload } from '../auth/jwt-token.service';
import { CompanyEntity } from '../organization/entities/company.entity';
import { UserEntity } from '../users/entities/user.entity';

export interface ScopedResource {
  companyId?: string | null;
  areaId?: string | null;
}

interface UserScope {
  isAdmin: boolean;
  isPrincipalCompanyUser: boolean;
  companyIds: Set<string>;
  areaIds: Set<string>;
  primaryCompany: CompanyEntity | null;
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

  async canReviewInspectionFindings(user: AccessTokenPayload): Promise<boolean> {
    const scope = await this.getUserScope(user);
    return scope.isAdmin || scope.isPrincipalCompanyUser;
  }

  async getInspectionAssignmentScope(user: AccessTokenPayload): Promise<InspectionAssignmentScopeResponse> {
    const scope = await this.getUserScope(user);
    return {
      canSelectCompany: scope.isAdmin || scope.isPrincipalCompanyUser,
      companyId: scope.primaryCompany?.id ?? null,
      companyName: scope.primaryCompany?.name ?? null,
    };
  }

  async resolveInspectionAssignmentCompany(user: AccessTokenPayload, requestedCompanyId: string | null | undefined): Promise<string | null> {
    const scope = await this.getUserScope(user);
    if (scope.isAdmin || scope.isPrincipalCompanyUser) return requestedCompanyId ?? null;
    if (!scope.primaryCompany) throw new ForbiddenException('The user has no company assigned for inspection findings');
    return scope.primaryCompany.id;
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
      (company): company is CompanyEntity => Boolean(company),
    );
    const uniqueCompanies = Array.from(new Map(companies.map((company) => [company.id, company])).values());

    if (row?.companyId) companyIds.add(row.companyId);
    for (const userCompany of row?.userCompanies ?? []) companyIds.add(userCompany.company.id);
    if (row?.areaId) areaIds.add(row.areaId);
    for (const userArea of row?.userAreas ?? []) areaIds.add(userArea.area.id);

    return {
      isAdmin,
      isPrincipalCompanyUser: uniqueCompanies.some((company) => this.isPrincipalCompany(company)) || user.email.toLowerCase().endsWith('@goldfields.com'),
      companyIds,
      areaIds,
      primaryCompany: row?.company ?? uniqueCompanies[0] ?? null,
    };
  }

  private isPrincipalCompany(company: CompanyEntity): boolean {
    const code = company.code?.trim().toUpperCase() ?? '';
    const name = company.name.trim().toLowerCase();
    return code === 'CORP' || company.isContractor === false || name.includes('gold field');
  }
}
