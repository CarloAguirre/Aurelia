import type { MueType } from '../enums';
import type { BaseEntity } from './entity.interface';

export interface Mue extends BaseEntity {
  name: string;
  code: string;
  type: MueType;
}
