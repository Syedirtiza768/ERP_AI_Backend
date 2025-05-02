// src/common/services/seed.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../../roles/roles.service';
import { PermissionsService } from '../../permissions/permissions.service';
import { UserRolesService } from '../../user-roles/user-roles.service';
import { RolePermissionsService } from '../../role-permissions/role-permissions.service';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private permissionsService: PermissionsService,
    private userRolesService: UserRolesService,
    private rolePermissionsService: RolePermissionsService,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdminUser();
  }

  private async seedPermissions() {
    const resources = ['users', 'roles', 'permissions'];
    const actions = ['create', 'read', 'update', 'delete'];

    for (const resource of resources) {
      for (const action of actions) {
        const name = `${action}:${resource}`;
        try {
          await this.permissionsService.create({
            name,
            description: `Ability to ${action} ${resource}`,
            resource,
            action,
          });
          console.log(`Created permission: ${name}`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`Permission ${name} already exists`);
          } else {
            console.error(`Error creating permission ${name}:`, error);
          }
        }
      }
    }
  }

  private async seedRoles() {
    // Admin role
    try {
      const adminRole = await this.rolesService.create({
        name: 'Admin',
        description: 'System administrator with full access',
      });

      // Get all permissions
      const permissions = await this.permissionsService.findAll();
      const permissionIds = permissions.map(p => p.id);

      // Assign all permissions to admin role
      await this.rolePermissionsService.assignPermissionsToRole({
        roleId: adminRole.id,
        permissionIds,
      });
      
      console.log('Created Admin role');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Admin role already exists');
      } else {
        console.error('Error creating Admin role:', error);
      }
    }

    // User role
    try {
      const userRole = await this.rolesService.create({
        name: 'User',
        description: 'Regular user with limited access',
      });

      // Get read permissions
      const readPermissions = await Promise.all(
        ['users', 'roles', 'permissions'].map(resource =>
          this.permissionsService.findByName(`read:${resource}`),
        ),
      );
      
      const permissionIds = readPermissions.map(p => p.id);

      // Assign read permissions to user role
      await this.rolePermissionsService.assignPermissionsToRole({
        roleId: userRole.id,
        permissionIds,
      });
      
      console.log('Created User role');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('User role already exists');
      } else {
        console.error('Error creating User role:', error);
      }
    }
  }

  private async seedAdminUser() {
    try {
      // Create admin user
      const adminUser = await this.usersService.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // In production, use a secure password
      });

      // Get admin role
      const adminRole = await this.rolesService.findByName('Admin');

      // Assign admin role to user
      await this.userRolesService.assignRole({
        userId: adminUser.id,
        roleId: adminRole.id,
      });
      
      console.log('Created Admin user');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Admin user already exists');
      } else {
        console.error('Error creating Admin user:', error);
      }
    }
  }
}