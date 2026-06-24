import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('incident_action_evidences')
export class IncidentActionEvidenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'action_plan_id', type: 'uuid' })
  actionPlanId: string;

  @Column({ name: 'evidence_id', type: 'uuid' })
  evidenceId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
