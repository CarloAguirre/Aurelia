import type { MueType } from '../../enums';

export interface CreateMueRequest {
  name: string;
  code: string;
  type: MueType;
}
