import { Injectable } from '@nestjs/common';
import type { InspectionResponse } from '@aurelia/contracts';
import type { CreateInspectionDto } from './dto/create-inspection.dto';
import type { UpdateInspectionStatusDto } from './dto/update-inspection-status.dto';

@Injectable()
export class InspectionsService {
  findAll(): Promise<InspectionResponse[]> {
    return Promise.resolve([]);
  }

  create(_dto: CreateInspectionDto, _inspectorId: string): Promise<InspectionResponse> {
    return Promise.reject(new Error('Inspections API will be implemented in phase 4B'));
  }

  updateStatus(_id: string, _dto: UpdateInspectionStatusDto): Promise<InspectionResponse> {
    return Promise.reject(new Error('Inspections API will be implemented in phase 4B'));
  }
}
