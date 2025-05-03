// src/auth/auth.controller.ts
import { Controller, Post, Body, Req, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(
      loginDto,
      req.ip || '127.0.0.1',
      req.headers['user-agent'] || '',
    );
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() body: { refresh_token: string; user_id: string }) {
    return this.authService.refreshToken(body.refresh_token, body.user_id);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    const user = req.user as RequestUser;
    
    // Revoke all refresh tokens for this user
    await this.authService.logout(user.id);
    
    // Log the logout action
    await this.auditLogsService.create({
      userId: user.id,
      username: user.username,
      action: ActionType.LOGOUT,
      resource: 'auth',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
    });
    
    return { message: 'Logged out successfully' };
  }

  @Get('check-permissions')
  checkPermissions(
    @CurrentUser() user: RequestUser,
    @Query('permissions') permissions: string,
  ) {
    return this.authService.checkPermissions(user.id, permissions.split(','));
  }
}