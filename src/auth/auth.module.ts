// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { UserRolesModule } from 'src/user-roles/user-roles.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AuditLogsModule,
    UserRolesModule,
    JwtModule.register({
      secret: 'your-secret-key', // In production, use environment variables
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}