// src/role-permissions/role-permissions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RolesService } from '../roles/roles.service';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolePermissionsService {
  constructor(
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
  ) {}

  async assignPermissionsToRole(assignPermissionsDto: AssignPermissionsDto): Promise<Role> {
    const { roleId, permissionIds } = assignPermissionsDto;

    // Check if role exists
    const role = await this.rolesService.findOne(roleId);

    // Check if all permissions exist
    const permissions = await this.permissionsService.findByIds(permissionIds);
    
    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Update role with new permissions
    role.permissions = permissions;

    // Save the updated role
    return this.rolesService.save(role);
  }

  async getPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    const role = await this.rolesService.findOne(roleId);
    return role.permissions;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.rolesService.findOne(roleId);
    
    // Filter out the permission to remove
    role.permissions = role.permissions.filter(
      permission => permission.id !== permissionId
    );
    
    // Save the updated role
    return this.rolesService.save(role);
  }
}