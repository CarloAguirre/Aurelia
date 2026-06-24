import { InspectionFollowupStatus } from '@aurelia/contracts';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('inspection_followups')
export class InspectionFollowupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'finding_id', type: 'uuid' })
  findingId: string;

  @Column({ name: 'sequence_number', type: 'integer' })
  sequenceNumber: number;

  @Column({
    type: 'enum',
    enum: InspectionFollowupStatus,
    enumName: 'inspection_followup_status',
    default: InspectionFollowupStatus.PENDING,
  })
  status: InspectionFollowupStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'performed_by_user_id', type: 'uuid', nullable: true })
  performedByUserId: string | null;

  @Column({ name: 'performed_at', type: 'timestamptz', nullable: true })
  performedAt: Date | null;

  @Column({ name: 'next_due_at', type: 'timestamptz', nullable: true })
  nextDueAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
