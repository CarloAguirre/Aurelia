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
import { InspectionFormSectionEntity } from './inspection-form-section.entity';
import { InspectionTypeEntity } from './inspection-type.entity';
import { InspectionEntity } from './inspection.entity';

@Entity('inspection_checklist_templates')
export class InspectionFormTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_inspection_templates_type')
  @Column({ name: 'inspection_type_id', type: 'uuid' })
  inspectionTypeId: string;

  @ManyToOne(() => InspectionTypeEntity, (type) => type.templates)
  @JoinColumn({ name: 'inspection_type_id' })
  inspectionType: InspectionTypeEntity;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => InspectionFormSectionEntity, (section) => section.template)
  sections: InspectionFormSectionEntity[];

  @OneToMany(() => InspectionEntity, (inspection) => inspection.template)
  inspections: InspectionEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
