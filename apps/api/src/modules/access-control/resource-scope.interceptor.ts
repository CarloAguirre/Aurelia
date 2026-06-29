import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { Observable, mergeMap } from 'rxjs';
import { Repository } from 'typeorm';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { IncidentEntity } from '../incidents/entities/incident.entity';
import { InspectionEntity } from '../inspections/entities/inspection.entity';
import { ResourceScopeService, ScopedResource } from './resource-scope.service';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class ResourceScopeInterceptor implements NestInterceptor {
  constructor(
    private readonly resourceScope: ResourceScopeService,
    @InjectRepository(InspectionEntity)
    private readonly inspections: Repository<InspectionEntity>,
    @InjectRepository(IncidentEntity)
    private readonly incidents: Repository<IncidentEntity>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest & Request>();

    return next.handle().pipe(
      mergeMap(async (body) => this.filterResponse(request, body)),
    );
  }

  private async filterResponse(request: AuthenticatedRequest & Request, body: unknown): Promise<unknown> {
    if (!request.user) return body;
    const path = request.originalUrl.split('?')[0];

    if (request.method === 'GET' && path === '/api/inspections' && Array.isArray(body)) {
      return this.resourceScope.filterAllowed(request.user, body.filter(this.isScopedResource));
    }

    if (request.method === 'GET' && path === '/api/incidents' && Array.isArray(body)) {
      return this.resourceScope.filterAllowed(request.user, body.filter(this.isScopedResource));
    }

    if (this.isScopedResource(body)) {
      const allowed = await this.resourceScope.canAccess(request.user, body);
      if (!allowed) throw new ForbiddenException('Resource is outside user scope');
    }

    return body;
  }

  async validateRequestScope(request: AuthenticatedRequest & Request): Promise<void> {
    if (!request.user) return;
    const path = request.originalUrl.split('?')[0];

    if (request.method === 'POST' && (path === '/api/inspections' || path === '/api/incidents') && this.isScopedResource(request.body)) {
      const allowed = await this.resourceScope.canAccess(request.user, request.body);
      if (!allowed) throw new ForbiddenException('Resource is outside user scope');
    }
  }

  private isScopedResource(value: unknown): value is ScopedResource {
    if (!value || Array.isArray(value) || typeof value !== 'object') return false;
    const resource = value as Record<string, unknown>;
    return 'companyId' in resource || 'areaId' in resource;
  }
}
