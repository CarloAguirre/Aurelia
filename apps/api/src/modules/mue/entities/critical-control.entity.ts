import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ControlVerificationItemEntity } from './control-verification-item.entity';
import { MueEntity } from './mue.entity';

@Entity('critical_controls')
@Index('uq_critical_controls_mue_code', ['mueId', 'code'], { unique: true })
export class CriticalControlEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_critical_controls_mue')
  @Column({ name: 'mue_id', type: 'uuid' })
  mueId: string;

  @ManyToOne(() => MueEntity, (mue) => mue.controls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mue_id' })
  mue: MueEntity;

  @Column({ type: 'varchar', length: 40 })
  code: string;

  @Column({ type: 'varchar', length: 240 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'control_type', type: 'varchar', length: 20 })
  controlType: string;

  @Column({ type: 'text', nullable: true })
  objective: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ControlVerificationItemEntity, (item) => item.criticalControl)
  verificationItems: ControlVerificationItemEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
