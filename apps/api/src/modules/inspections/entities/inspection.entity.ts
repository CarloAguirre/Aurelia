import { InspectionStatus } from '@aurelia/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inspections')
export class InspectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_inspections_type')
  @Column({ name: 'inspection_type_id', type: 'uuid' })
  inspectionTypeId: string;

  @Index('idx_inspections_template')
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string | null;

  @Index('idx_inspections_company')
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string | null;

  @Index('idx_inspections_area')
  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string | null;

  @Index('idx_inspections_inspector')
  @Column({ name: 'inspector_user_id', type: 'uuid', nullable: true })
  inspectorId: string | null;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  get code(): string {
    return '';
  }

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index('idx_inspections_status')
  @Column({
    type: 'enum',
    enum: InspectionStatus,
    enumName: 'inspection_status',
    default: InspectionStatus.DRAFT,
  })
  status: InspectionStatus;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude: string | null;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  score: string | null;

  @Column({ name: 'findings_count', type: 'integer', default: 0 })
  findingsCount: number;

  @Column({ name: 'open_findings_count', type: 'integer', default: 0 })
  openFindingsCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
