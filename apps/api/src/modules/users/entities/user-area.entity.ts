import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AreaEntity } from '../../organization/entities/area.entity';
import { UserEntity } from './user.entity';

@Entity('user_areas')
@Unique('uq_user_areas_user_area', ['user', 'area'])
export class UserAreaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.userAreas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => AreaEntity, (area) => area.userAreas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: AreaEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
