import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AreaType } from '@aurelia/contracts';

/**
 * PLACEHOLDER — entidad provisional, no es el modelo definitivo.
 * El modelo relacional y las reglas de negocio aún no están definidos.
 * No generar migraciones de dominio a partir de esta entidad todavía.
 * Ver docs/DEVELOPMENT_WORKFLOW.md ("Estado del proyecto").
 */
@Entity('areas')
export class AreaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AreaType })
  type: AreaType;

  @Column('uuid')
  mueId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
