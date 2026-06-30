import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CriticalControlEntity } from './critical-control.entity';

@Entity('mues')
export class MueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('uq_mues_code', { unique: true })
  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'predominant_control_type', type: 'varchar', length: 80, nullable: true })
  predominantControlType: string | null;

  @Column({ name: 'expected_main_evidence', type: 'text', nullable: true })
  expectedMainEvidence: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => CriticalControlEntity, (control) => control.mue)
  controls: CriticalControlEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
