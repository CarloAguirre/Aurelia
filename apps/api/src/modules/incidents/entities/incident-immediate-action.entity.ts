import { IncidentActionPlanStatus } from '@aurelia/contracts';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('incident_immediate_actions')
export class IncidentImmediateActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'incident_id', type: 'uuid' })
  incidentId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: IncidentActionPlanStatus, enumName: 'incident_action_plan_status', default: IncidentActionPlanStatus.OPEN })
  status: IncidentActionPlanStatus;

  @Column({ name: 'performed_by_user_id', type: 'uuid', nullable: true })
  performedByUserId: string | null;

  @Column({ name: 'performed_at', type: 'timestamptz', nullable: true })
  performedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
