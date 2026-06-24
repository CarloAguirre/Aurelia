import { IncidentStatus } from '@aurelia/contracts';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('incidents')
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'incident_type_id', type: 'uuid' })
  incidentTypeId: string;

  @Column({ name: 'incident_level_id', type: 'uuid' })
  incidentLevelId: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string | null;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string | null;

  @Column({ name: 'reported_by_user_id', type: 'uuid', nullable: true })
  reportedByUserId: string | null;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: IncidentStatus, enumName: 'incident_status', default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;

  @Column({ name: 'reported_at', type: 'timestamptz', default: () => 'now()' })
  reportedAt: Date;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ name: 'immediate_response_summary', type: 'text', nullable: true })
  immediateResponseSummary: string | null;

  @Column({ name: 'environmental_impact_summary', type: 'text', nullable: true })
  environmentalImpactSummary: string | null;

  @Column({ name: 'sla_due_at', type: 'timestamptz', nullable: true })
  slaDueAt: Date | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ name: 'closed_by_user_id', type: 'uuid', nullable: true })
  closedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
