import { Module } from '@nestjs/common';
import { InspectionsModule } from '../inspections/inspections.module';
import { OrganizationModule } from '../organization/organization.module';
import { UsersModule } from '../users/users.module';
import { MobileBootstrapController } from './mobile-bootstrap.controller';
import { MobileBootstrapService } from './mobile-bootstrap.service';

@Module({
  imports: [OrganizationModule, InspectionsModule, UsersModule],
  controllers: [MobileBootstrapController],
  providers: [MobileBootstrapService],
})
export class MobileBootstrapModule {}
