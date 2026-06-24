import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('inspection_checklist_answers')
export class InspectionItemResponseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inspection_id', type: 'uuid' })
  inspectionId: string;

  @Column({ name: 'checklist_item_id', type: 'uuid' })
  checklistItemId: string;

  @Column({ name: 'answer_value', type: 'varchar', length: 80, nullable: true })
  answerValue: string | null;

  @Column({ name: 'answer_text', type: 'text', nullable: true })
  answerText: string | null;

  @Column({ name: 'numeric_value', type: 'numeric', precision: 18, scale: 6, nullable: true })
  numericValue: string | null;

  @Column({ name: 'answered_by_user_id', type: 'uuid', nullable: true })
  answeredByUserId: string | null;

  @Column({ name: 'answered_at', type: 'timestamptz', nullable: true })
  answeredAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
