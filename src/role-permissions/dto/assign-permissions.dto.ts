// src/role-permissions/dto/assign-permissions.dto.ts
import { IsNotEmpty, IsUUID, IsArray } from 'class-validator';

export class AssignPermissionsDto {
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @IsNotEmpty()
  @IsArray()
  permissionIds: string[];
}