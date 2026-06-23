import type { AreaType } from '../enums';
import type { ID } from '../types/common';
import type { BaseEntity } from './entity.interface';

export interface Area extends BaseEntity {
  name: string;
  type: AreaType;
  mueId: ID;
}
