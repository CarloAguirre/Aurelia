import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  AreaResponse,
  BusinessUnitResponse,
  CompanyResponse,
  GerenciaResponse,
  LocationResponse,
  SectorResponse,
} from '@aurelia/contracts';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateBusinessUnitDto } from './dto/create-business-unit.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateGerenciaDto } from './dto/create-gerencia.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { CreateSectorDto } from './dto/create-sector.dto';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('business-units')
  findBusinessUnits(): Promise<BusinessUnitResponse[]> {
    return this.organizationService.findBusinessUnits();
  }

  @Post('business-units')
  createBusinessUnit(@Body() dto: CreateBusinessUnitDto): Promise<BusinessUnitResponse> {
    return this.organizationService.createBusinessUnit(dto);
  }

  @Get('gerencias')
  findGerencias(): Promise<GerenciaResponse[]> {
    return this.organizationService.findGerencias();
  }

  @Post('gerencias')
  createGerencia(@Body() dto: CreateGerenciaDto): Promise<GerenciaResponse> {
    return this.organizationService.createGerencia(dto);
  }

  @Get('areas')
  findAreas(): Promise<AreaResponse[]> {
    return this.organizationService.findAreas();
  }

  @Post('areas')
  createArea(@Body() dto: CreateAreaDto): Promise<AreaResponse> {
    return this.organizationService.createArea(dto);
  }

  @Get('sectors')
  findSectors(): Promise<SectorResponse[]> {
    return this.organizationService.findSectors();
  }

  @Post('sectors')
  createSector(@Body() dto: CreateSectorDto): Promise<SectorResponse> {
    return this.organizationService.createSector(dto);
  }

  @Get('locations')
  findLocations(): Promise<LocationResponse[]> {
    return this.organizationService.findLocations();
  }

  @Post('locations')
  createLocation(@Body() dto: CreateLocationDto): Promise<LocationResponse> {
    return this.organizationService.createLocation(dto);
  }

  @Get('companies')
  findCompanies(): Promise<CompanyResponse[]> {
    return this.organizationService.findCompanies();
  }

  @Post('companies')
  createCompany(@Body() dto: CreateCompanyDto): Promise<CompanyResponse> {
    return this.organizationService.createCompany(dto);
  }
}
