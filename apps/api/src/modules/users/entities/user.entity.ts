import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '@aurelia/contracts';

/**
 * PLACEHOLDER — entidad provisional, no es el modelo definitivo.
 * El modelo relacional y las reglas de negocio aún no están definidos.
 * No generar migraciones de dominio a partir de esta entidad todavía.
 * Ver docs/DEVELOPMENT_WORKFLOW.md ("Estado del proyecto").
 */
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: Role, default: Role.VIEWER })
  role: Role;

  @Column({ type: 'uuid', nullable: true })
  areaId: string | null;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
