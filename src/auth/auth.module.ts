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
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    AuditLogsModule,
    UserRolesModule,
    TypeOrmModule.forFeature([RefreshToken]), // Add this line
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'your-access-token-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenService, // Add this line
    {
      provide: 'JWT_REFRESH_TOKEN_CONFIG',
      useValue: {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key',
        expiresIn: '7d',
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}