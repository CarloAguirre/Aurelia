import { Injectable } from '@nestjs/common';
import type { MobileBootstrapResponse } from '@aurelia/contracts';
import { InspectionsService } from '../inspections/inspections.service';
import { OrganizationService } from '../organization/organization.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MobileBootstrapService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly inspectionsService: InspectionsService,
    private readonly usersService: UsersService,
  ) {}

  async buildBootstrap(): Promise<MobileBootstrapResponse> {
    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [areas, sectors, companies, users, inspectionTypes, inspectionTemplates] = await Promise.all([
      this.organizationService.findAreas(),
      this.organizationService.findSectors(),
      this.organizationService.findCompanies(),
      this.usersService.findAll(),
      this.inspectionsService.findTypes(),
      this.inspectionsService.findTemplates(),
    ]);

    return {
      bootstrapVersion: `mobile-bootstrap-${generatedAt.toISOString().slice(0, 10)}`,
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      catalogs: {
        areas,
        sectors,
        companies,
        users,
        inspectionTypes,
        inspectionTemplates,
      },
      offlinePolicy: {
        maxOfflineDays: 7,
        requiresBiometricOrPin: true,
        maxPendingQueueItems: 500,
        maxAttachmentSizeMb: 10,
      },
    };
  }
}
