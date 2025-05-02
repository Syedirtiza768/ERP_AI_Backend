// src/roles/roles.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role with the same name already exists
    const existingRole = await this.rolesRepository.findOne({ 
      where: { name: createRoleDto.name } 
    });
    
    if (existingRole) {
      throw new ConflictException(`Role with name "${createRoleDto.name}" already exists`);
    }

    const role = this.rolesRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
    });

    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ 
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ 
      where: { name },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with name "${name}" not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      // Check if the new name is already taken
      const existingRole = await this.rolesRepository.findOne({ 
        where: { name: updateRoleDto.name } 
      });
      
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(`Role with name "${updateRoleDto.name}" already exists`);
      }
    }

    // Update the role
    await this.rolesRepository.update(id, {
      name: updateRoleDto.name,
      description: updateRoleDto.description,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }

  async save(role: Role): Promise<Role> {
    return this.rolesRepository.save(role);
  }
}