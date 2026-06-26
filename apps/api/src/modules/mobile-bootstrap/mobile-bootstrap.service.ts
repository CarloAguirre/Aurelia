import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MobileBootstrapResponse, UserResponse } from '@aurelia/contracts';
import { InspectionsService } from '../inspections/inspections.service';
import { OrganizationService } from '../organization/organization.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MobileBootstrapService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly inspectionsService: InspectionsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async buildBootstrap(): Promise<MobileBootstrapResponse> {
    const generatedAt = new Date();
    const [areas, sectors, companies, inspectionTypes, inspectionTemplates] = await Promise.all([
      this.organizationService.findAreas(),
      this.organizationService.findSectors(),
      this.organizationService.findCompanies(),
      this.inspectionsService.findTypes(),
      this.inspectionsService.findTemplates(),
    ]);
    const users = await this.findAvailableUsers();
    const maxOfflineDays = this.getNumber('MOBILE_BOOTSTRAP_MAX_OFFLINE_DAYS', 7);
    const expiresAt = new Date(generatedAt.getTime() + maxOfflineDays * 24 * 60 * 60 * 1000);
    const catalogs = { areas, sectors, companies, users, inspectionTypes, inspectionTemplates };

    return {
      bootstrapVersion: this.createBootstrapVersion(catalogs),
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      catalogs,
      offlinePolicy: {
        maxOfflineDays,
        requiresBiometricOrPin: this.getBoolean('MOBILE_BOOTSTRAP_REQUIRES_BIOMETRIC_OR_PIN', false),
        maxPendingQueueItems: this.getNumber('MOBILE_BOOTSTRAP_MAX_PENDING_QUEUE_ITEMS', 500),
        maxAttachmentSizeMb: this.getNumber('MOBILE_BOOTSTRAP_MAX_ATTACHMENT_SIZE_MB', 25),
      },
    };
  }

  private async findAvailableUsers(): Promise<UserResponse[]> {
    try {
      return await this.usersService.findAll();
    } catch {
      return [];
    }
  }

  private createBootstrapVersion(catalogs: MobileBootstrapResponse['catalogs']): string {
    const timestamps = [
      ...catalogs.areas.map((item) => item.updatedAt),
      ...catalogs.sectors.map((item) => item.updatedAt),
      ...catalogs.companies.map((item) => item.updatedAt),
      ...catalogs.users.map((item) => item.updatedAt),
      ...catalogs.inspectionTypes.map((item) => item.updatedAt),
      ...catalogs.inspectionTemplates.map((item) => item.updatedAt),
      ...catalogs.inspectionTemplates.flatMap((template) => template.sections.map((section) => section.updatedAt)),
      ...catalogs.inspectionTemplates.flatMap((template) => template.sections.flatMap((section) => section.items.map((item) => item.updatedAt))),
    ].sort();
    const latest = timestamps.length > 0 ? timestamps[timestamps.length - 1] : 'empty';
    const counts = [
      catalogs.areas.length,
      catalogs.sectors.length,
      catalogs.companies.length,
      catalogs.users.length,
      catalogs.inspectionTypes.length,
      catalogs.inspectionTemplates.length,
    ].join('-');

    return `mobile-bootstrap:${latest}:${counts}`;
  }

  private getNumber(key: string, fallback: number): number {
    const value = this.configService.get<string>(key);
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private getBoolean(key: string, fallback: boolean): boolean {
    const value = this.configService.get<string>(key);
    if (!value) return fallback;
    return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
  }
}
