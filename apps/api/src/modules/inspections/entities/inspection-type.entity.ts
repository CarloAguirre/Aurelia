import { InspectionType, RecordStatus } from '@aurelia/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InspectionChecklistTemplateEntity } from './inspection-checklist-template.entity';
import { InspectionEntity } from './inspection.entity';

@Entity('inspection_types')
export class InspectionTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  code: InspectionType;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: RecordStatus,
    enumName: 'record_status',
    default: RecordStatus.ACTIVE,
  })
  status: RecordStatus;

  @OneToMany(() => InspectionChecklistTemplateEntity, (template) => template.inspectionType)
  templates: InspectionChecklistTemplateEntity[];

  @OneToMany(() => InspectionEntity, (inspection) => inspection.inspectionType)
  inspections: InspectionEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
