import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('incident_validations')
export class IncidentValidationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'incident_id', type: 'uuid' })
  incidentId: string;

  @Column({ type: 'varchar', length: 80 })
  status: string;

  @Column({ name: 'validator_user_id', type: 'uuid', nullable: true })
  validatorUserId: string | null;

  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @Column({ name: 'validated_at', type: 'timestamptz', nullable: true })
  validatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
