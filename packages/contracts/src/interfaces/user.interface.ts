import type { Role } from '../enums';
import type { ID } from '../types/common';
import type { BaseEntity } from './entity.interface';

export interface User extends BaseEntity {
  email: string;
  fullName: string;
  role: Role;
  areaId: ID | null;
  active: boolean;
}
