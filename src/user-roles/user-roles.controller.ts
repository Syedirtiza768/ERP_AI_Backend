// src/user-roles/user-roles.controller.ts
import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UserRole } from './entities/user-role.entity';

@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  assignRole(@Body() assignRoleDto: AssignRoleDto): Promise<UserRole> {
    return this.userRolesService.assignRole(assignRoleDto);
  }

  @Get('user/:userId')
  findUserRoles(@Param('userId') userId: string): Promise<UserRole[]> {
    return this.userRolesService.findUserRoles(userId);
  }

  @Delete('user/:userId/role/:roleId')
  removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<void> {
    return this.userRolesService.removeRole(userId, roleId);
  }
}