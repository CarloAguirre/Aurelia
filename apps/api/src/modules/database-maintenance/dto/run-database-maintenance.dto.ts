import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class RunDatabaseMaintenanceDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seeds?: string[];

  @IsOptional()
  @IsBoolean()
  allowRisky?: boolean;
}
