import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EvidenceEntity } from '../../evidences/entities/evidence.entity';
import { ControlSelfAssessmentAnswerEntity } from './control-self-assessment-answer.entity';

@Entity('control_evidences')
@Index('uq_control_evidences_answer_evidence', ['answerId', 'evidenceId'], { unique: true })
export class ControlEvidenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_control_evidences_answer')
  @Column({ name: 'answer_id', type: 'uuid' })
  answerId: string;

  @ManyToOne(() => ControlSelfAssessmentAnswerEntity, (answer) => answer.evidences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'answer_id' })
  answer: ControlSelfAssessmentAnswerEntity;

  @Column({ name: 'evidence_id', type: 'uuid' })
  evidenceId: string;

  @ManyToOne(() => EvidenceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evidence_id' })
  evidence: EvidenceEntity;

  @Column({ name: 'relation_type', type: 'varchar', length: 80, default: 'control_assessment' })
  relationType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
