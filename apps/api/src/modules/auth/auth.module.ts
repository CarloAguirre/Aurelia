import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CredentialHashService } from './credential-hash.service';
import { UserSessionEntity } from './entities/user-session.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtTokenService } from './jwt-token.service';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserSessionEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    CredentialHashService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [JwtTokenService, CredentialHashService],
})
export class AuthModule {}
