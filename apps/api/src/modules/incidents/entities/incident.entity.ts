import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IncidentRiskLevel, IncidentStatus, IncidentType } from '@aurelia/contracts';

/**
 * PLACEHOLDER — entidad provisional, no es el modelo definitivo.
 * El modelo relacional y las reglas de negocio aún no están definidos.
 * No generar migraciones de dominio a partir de esta entidad todavía.
 * Ver docs/DEVELOPMENT_WORKFLOW.md ("Estado del proyecto").
 */
@Entity('incidents')
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: IncidentType })
  type: IncidentType;

  @Column({ type: 'enum', enum: IncidentRiskLevel })
  riskLevel: IncidentRiskLevel;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @Column('uuid')
  areaId: string;

  @Column('uuid')
  mueId: string;

  @Column('uuid')
  reportedById: string;

  @Column({ type: 'timestamptz' })
  occurredAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
