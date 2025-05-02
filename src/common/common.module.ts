// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { SeedService } from './services/seed.service';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { RolePermissionsModule } from '../role-permissions/role-permissions.module';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    PermissionsModule,
    UserRolesModule,
    RolePermissionsModule,
  ],
  providers: [SeedService],
})
export class CommonModule {}