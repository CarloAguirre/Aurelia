import {
  InspectionStatus,
} from '@aurelia/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AreaEntity } from '../../organization/entities/area.entity';
import { CompanyEntity } from '../../organization/entities/company.entity';
import { LocationEntity } from '../../organization/entities/location.entity';
import { SectorEntity } from '../../organization/entities/sector.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { InspectionChecklistAnswerEntity } from './inspection-checklist-answer.entity';
import { InspectionChecklistTemplateEntity } from './inspection-checklist-template.entity';
import { InspectionFindingEntity } from './inspection-finding.entity';
import { InspectionStatusHistoryEntity } from './inspection-status-history.entity';
import { InspectionTypeEntity } from './inspection-type.entity';

@Entity('inspections')
export class InspectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_inspections_type')
  @Column({ name: 'inspection_type_id', type: 'uuid' })
  inspectionTypeId: string;

  @ManyToOne(() => InspectionTypeEntity, (type) => type.inspections, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inspection_type_id' })
  inspectionType: InspectionTypeEntity;

  @Index('idx_inspections_template')
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId: string | null;

  @ManyToOne(() => InspectionChecklistTemplateEntity, (template) => template.inspections, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'template_id' })
  template: InspectionChecklistTemplateEntity | null;

  @Index('idx_inspections_company')
  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string | null;

  @ManyToOne(() => CompanyEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: CompanyEntity | null;

  @Index('idx_inspections_area')
  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @ManyToOne(() => AreaEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'area_id' })
  area: AreaEntity | null;

  @Column({ name: 'sector_id', type: 'uuid', nullable: true })
  sectorId: string | null;

  @ManyToOne(() => SectorEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sector_id' })
  sector: SectorEntity | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string | null;

  @ManyToOne(() => LocationEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity | null;

  @Index('idx_inspections_inspector')
  @Column({ name: 'inspector_user_id', type: 'uuid', nullable: true })
  inspectorId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inspector_user_id' })
  inspector: UserEntity | null;

  @Column({ type: 'varchar', length: 180 })
  title: string;

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

  @OneToMany(() => InspectionChecklistAnswerEntity, (answer) => answer.inspection)
  answers: InspectionChecklistAnswerEntity[];

  @OneToMany(() => InspectionFindingEntity, (finding) => finding.inspection)
  findings: InspectionFindingEntity[];

  @OneToMany(() => InspectionStatusHistoryEntity, (history) => history.inspection)
  statusHistory: InspectionStatusHistoryEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
