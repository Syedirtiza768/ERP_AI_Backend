import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { Permission } from './permissions/entities/permission.entity';
import { Role } from './roles/entities/role.entity';
import { UserRole } from './user-roles/entities/user-role.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'erp_system_ai',
    entities: [User, Role, Permission, UserRole],

    synchronize: true,
    
  }), UsersModule, RolesModule, PermissionsModule, UserRolesModule,  
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
