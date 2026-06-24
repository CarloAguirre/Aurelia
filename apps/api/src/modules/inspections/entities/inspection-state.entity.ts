import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inspection_status_history')
export class InspectionStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inspection_id', type: 'uuid' })
  inspectionId: string;

  @Column({ name: 'from_status', type: 'varchar', length: 80, nullable: true })
  previousStatus: string | null;

  @Column({ name: 'to_status', type: 'varchar', length: 80 })
  nextStatus: string;

  @Column({ name: 'changed_by_user_id', type: 'uuid', nullable: true })
  changedByUserId: string | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
