import { InspectionFindingSeverity, InspectionFindingStatus } from '@aurelia/contracts';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('inspection_findings')
export class InspectionFindingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inspection_id', type: 'uuid' })
  inspectionId: string;

  @Column({ name: 'checklist_item_id', type: 'uuid', nullable: true })
  checklistItemId: string | null;

  @Column({ name: 'finding_type_id', type: 'uuid', nullable: true })
  findingTypeId: string | null;

  @Column({ name: 'severity_id', type: 'uuid', nullable: true })
  severityId: string | null;

  @Column({ name: 'responsible_company_id', type: 'uuid', nullable: true })
  responsibleCompanyId: string | null;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'detected_condition', type: 'text', nullable: true })
  detectedCondition: string | null;

  @Column({ name: 'proposed_corrective_action', type: 'text', nullable: true })
  proposedCorrectiveAction: string | null;

  @Column({ name: 'executed_action_description', type: 'text', nullable: true })
  executedActionDescription: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'enum', enum: InspectionFindingSeverity, enumName: 'inspection_finding_severity' })
  severity: InspectionFindingSeverity;

  @Column({ type: 'enum', enum: InspectionFindingStatus, enumName: 'inspection_finding_status', default: InspectionFindingStatus.OPEN })
  status: InspectionFindingStatus;

  @Column({ name: 'owner_user_id', type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({ name: 'due_at', type: 'timestamptz', nullable: true })
  dueAt: Date | null;

  @Column({ name: 'executed_at', type: 'timestamptz', nullable: true })
  executedAt: Date | null;

  @Column({ name: 'executed_by_user_id', type: 'uuid', nullable: true })
  executedByUserId: string | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  @Column({ name: 'closed_by_user_id', type: 'uuid', nullable: true })
  closedByUserId: string | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'rejected_by_user_id', type: 'uuid', nullable: true })
  rejectedByUserId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
