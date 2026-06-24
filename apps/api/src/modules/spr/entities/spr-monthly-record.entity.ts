import { SprRecordStatus } from '@aurelia/contracts';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('spr_monthly_records')
export class SprMonthlyRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parameter_id', type: 'uuid' })
  parameterId: string;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId: string | null;

  @Column({ name: 'assignment_id', type: 'uuid', nullable: true })
  assignmentId: string | null;

  @Column({ name: 'period_year', type: 'integer' })
  periodYear: number;

  @Column({ name: 'period_month', type: 'integer' })
  periodMonth: number;

  @Column({ name: 'numeric_value', type: 'numeric', precision: 18, scale: 6, nullable: true })
  numericValue: string | null;

  @Column({ name: 'text_value', type: 'text', nullable: true })
  textValue: string | null;

  @Column({ name: 'boolean_value', type: 'boolean', nullable: true })
  booleanValue: boolean | null;

  @Column({ type: 'enum', enum: SprRecordStatus, enumName: 'spr_record_status', default: SprRecordStatus.DRAFT })
  status: SprRecordStatus;

  @Column({ name: 'submitted_by_user_id', type: 'uuid', nullable: true })
  submittedByUserId: string | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'approved_by_user_id', type: 'uuid', nullable: true })
  approvedByUserId: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
