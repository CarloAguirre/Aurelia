import type { ID } from '../types/common';
import type { BaseEntity } from './entity.interface';

export interface CriticalControl extends BaseEntity {
  name: string;
  code: string;
  description: string | null;
  areaId: ID;
}
