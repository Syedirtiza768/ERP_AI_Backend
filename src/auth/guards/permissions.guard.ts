// src/auth/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRolesService } from '../../user-roles/user-roles.service';
import { RequestUser } from '../../common/interfaces/user.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRolesService: UserRolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    
    if (!requiredPermissions) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser;
    
    if (!user) {
      return false;
    }
    
    // Get user roles with their permissions
    const userRoles = await this.userRolesService.findUserRoles(user.id);
    
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
    
    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    return true;
  }
}