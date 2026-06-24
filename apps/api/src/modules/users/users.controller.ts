import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { UserResponse } from '@aurelia/contracts';
import { AssignUserAreaDto } from './dto/assign-user-area.dto';
import { AssignUserCompanyDto } from './dto/assign-user-company.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('role') role?: string,
  ): Promise<UserResponse[]> {
    return this.usersService.findAll({ companyId, role });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponse> {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.create(dto);
  }

  @Post(':id/roles')
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUserRoleDto,
  ): Promise<UserResponse> {
    return this.usersService.assignRole(id, dto);
  }

  @Post(':id/companies')
  assignCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUserCompanyDto,
  ): Promise<UserResponse> {
    return this.usersService.assignCompany(id, dto);
  }

  @Post(':id/areas')
  assignArea(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUserAreaDto,
  ): Promise<UserResponse> {
    return this.usersService.assignArea(id, dto);
  }
}
