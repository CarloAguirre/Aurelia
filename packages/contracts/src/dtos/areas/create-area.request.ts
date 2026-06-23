import type { AreaType } from '../../enums';
import type { ID } from '../../types/common';

export interface CreateAreaRequest {
  name: string;
  type: AreaType;
  mueId: ID;
}
