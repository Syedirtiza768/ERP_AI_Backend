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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
    private userRolesService: UserRolesService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    
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
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
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