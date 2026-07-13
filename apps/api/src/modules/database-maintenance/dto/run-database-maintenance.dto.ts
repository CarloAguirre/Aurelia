import { IsArray, IsOptional, IsString } from 'class-validator';

export class RunDatabaseMaintenanceDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seeds?: string[];
}
