import { RecordStatus, SprConsolidationMethod } from '@aurelia/contracts';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('spr_consolidation_rules')
export class SprConsolidationRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parameter_id', type: 'uuid' })
  parameterId: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'enum', enum: SprConsolidationMethod, enumName: 'spr_consolidation_method' })
  method: SprConsolidationMethod;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, unknown> | null;

  @Column({ type: 'enum', enum: RecordStatus, enumName: 'record_status', default: RecordStatus.ACTIVE })
  status: RecordStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
