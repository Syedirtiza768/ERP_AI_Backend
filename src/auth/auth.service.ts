// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ActionType } from '../audit-logs/entities/audit-log.entity';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { RequestUser } from '../common/interfaces/user.interface';
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
    private userRolesService: UserRolesService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // console.log("email is" + email)
      // Make sure we're specifically looking up by email, not username
      const user = await this.usersService.findByEmail(email);
      console.log("user is" , user)
      // Only proceed with password comparison if user exists
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      // Explicitly return null for invalid credentials
      return null;
    }
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };
    
    // Log the login action
    await this.auditLogsService.create({
      userId: user.id,
      username: user.username,
      action: ActionType.LOGIN,
      resource: 'auth',
      ipAddress,
      userAgent,
    });
    
    // Generate both tokens
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.createRefreshToken(user.id);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async refreshToken(token: string, userId: string): Promise<{ access_token: string }> {
    const isValid = await this.refreshTokenService.validateRefreshToken(token, userId);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    const user = await this.usersService.findOne(userId);
    
    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(userId: string): Promise<void> {
    // Revoke all refresh tokens for the user
    await this.refreshTokenService.revokeAllUserRefreshTokens(userId);
  }

  async checkPermissions(userId: string, requiredPermissions: string[]): Promise<{ hasPermissions: boolean }> {
    // Get user roles with their permissions
    const userRoles = await this.userRolesService.findUserRoles(userId);
    
    // Extract all permission names from user roles
    const userPermissions = new Set<string>();
    userRoles.forEach(userRole => {
      userRole.role.permissions.forEach(permission => {
        userPermissions.add(permission.name);
      });
    });
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.has(permission),
    );
    
    return { hasPermissions: hasAllPermissions };
  }
}