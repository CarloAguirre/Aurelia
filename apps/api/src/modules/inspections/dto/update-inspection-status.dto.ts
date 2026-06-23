import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InspectionStatus, UpdateInspectionStatusRequest } from '@aurelia/contracts';

export class UpdateInspectionStatusDto implements UpdateInspectionStatusRequest {
  @IsEnum(InspectionStatus)
  status: InspectionStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
