import { WorkflowInstanceStatus } from '@aurelia/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityReferenceTypeEntity } from '../../evidences/entities/entity-reference-type.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { WorkflowDefinitionEntity } from './workflow-definition.entity';
import { WorkflowInstanceStepEntity } from './workflow-instance-step.entity';

@Entity('workflow_instances')
export class WorkflowInstanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workflow_definition_id', type: 'uuid', nullable: true })
  workflowDefinitionId: string | null;

  @ManyToOne(() => WorkflowDefinitionEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'workflow_definition_id' })
  workflowDefinition: WorkflowDefinitionEntity | null;

  @Index('idx_wi_entity')
  @Column({ name: 'entity_type', type: 'varchar', length: 80 })
  entityType: string;

  @ManyToOne(() => EntityReferenceTypeEntity)
  @JoinColumn({ name: 'entity_type', referencedColumnName: 'code' })
  entityReferenceType: EntityReferenceTypeEntity;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Index('idx_wi_status')
  @Column({
    type: 'enum',
    enum: WorkflowInstanceStatus,
    enumName: 'workflow_instance_status',
    default: WorkflowInstanceStatus.RUNNING,
  })
  status: WorkflowInstanceStatus;

  @Index('idx_wi_started_by')
  @Column({ name: 'started_by_user_id', type: 'uuid', nullable: true })
  startedByUserId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'started_by_user_id' })
  startedByUser: UserEntity | null;

  @Column({ name: 'started_at', type: 'timestamptz', default: () => 'now()' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => WorkflowInstanceStepEntity, (step) => step.workflowInstance)
  steps: WorkflowInstanceStepEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
