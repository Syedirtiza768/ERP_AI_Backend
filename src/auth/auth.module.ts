// src/auth/auth.module.ts (corrected)
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'your-access-token-secret-key',
        signOptions: { 
          expiresIn: configService.get('JWT_ACCESS_EXPIRES', '15m')
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenService,
    {
      provide: 'JWT_REFRESH_TOKEN_CONFIG',
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-token-secret-key',
        expiresIn: configService.get('JWT_REFRESH_EXPIRES', '7d'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}