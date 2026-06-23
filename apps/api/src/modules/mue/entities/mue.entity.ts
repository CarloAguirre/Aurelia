import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MueType } from '@aurelia/contracts';

/**
 * PLACEHOLDER — entidad provisional, no es el modelo definitivo.
 * El modelo relacional y las reglas de negocio aún no están definidos.
 * No generar migraciones de dominio a partir de esta entidad todavía.
 * Ver docs/DEVELOPMENT_WORKFLOW.md ("Estado del proyecto").
 */
@Entity('mue')
export class MueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: MueType })
  type: MueType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
