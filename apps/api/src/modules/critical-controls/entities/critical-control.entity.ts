import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PLACEHOLDER — entidad provisional, no es el modelo definitivo.
 * El modelo relacional y las reglas de negocio aún no están definidos.
 * No generar migraciones de dominio a partir de esta entidad todavía.
 * Ver docs/DEVELOPMENT_WORKFLOW.md ("Estado del proyecto").
 */
@Entity('critical_controls')
export class CriticalControlEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column('uuid')
  areaId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
