// src/role-permissions/role-permissions.controller.ts
import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Post()
  assignPermissions(@Body() assignPermissionsDto: AssignPermissionsDto): Promise<Role> {
    return this.rolePermissionsService.assignPermissionsToRole(assignPermissionsDto);
  }

  @Get('role/:roleId')
  getPermissionsByRoleId(@Param('roleId') roleId: string): Promise<Permission[]> {
    return this.rolePermissionsService.getPermissionsByRoleId(roleId);
  }

  @Delete('role/:roleId/permission/:permissionId')
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<Role> {
    return this.rolePermissionsService.removePermissionFromRole(roleId, permissionId);
  }
}