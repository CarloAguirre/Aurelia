import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('incident_investigation_team')
export class IncidentInvestigationTeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'investigation_id', type: 'uuid' })
  investigationId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 120 })
  role: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
