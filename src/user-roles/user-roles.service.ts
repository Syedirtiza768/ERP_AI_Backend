// src/user-roles/user-roles.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  async assignRole(assignRoleDto: AssignRoleDto): Promise<UserRole> {
    const { userId, roleId } = assignRoleDto;

    // Check if user exists
    const user = await this.usersService.findOne(userId);
    
    // Check if role exists
    const role = await this.rolesService.findOne(roleId);

    // Check if the assignment already exists
    const existingAssignment = await this.userRolesRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException(`User already has this role assigned`);
    }

    // Create the assignment
    const userRole = this.userRolesRepository.create({
      user,
      role,
    });

    return this.userRolesRepository.save(userRole);
  }

  async findUserRoles(userId: string): Promise<UserRole[]> {
    // Check if user exists
    await this.usersService.findOne(userId);

    return this.userRolesRepository.find({
      where: { user: { id: userId } },
      relations: ['role', 'role.permissions'],
    });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    // Check if the assignment exists
    const userRole = await this.userRolesRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId },
      },
    });

    if (!userRole) {
      throw new NotFoundException(`Role assignment not found`);
    }

    await this.userRolesRepository.remove(userRole);
  }
}