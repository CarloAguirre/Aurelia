import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtTokenService } from './jwt-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController],
  providers: [AuthService, JwtTokenService, JwtAuthGuard],
  exports: [JwtTokenService, JwtAuthGuard],
})
export class AuthModule {}
