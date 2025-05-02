// src/permissions/permissions.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission with the same name already exists
    const existingPermission = await this.permissionsRepository.findOne({ 
      where: { name: createPermissionDto.name } 
    });
    
    if (existingPermission) {
      throw new ConflictException(`Permission with name "${createPermissionDto.name}" already exists`);
    }

    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    return permission;
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionsRepository.findByIds(ids);
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
      // Check if the new name is already taken
      const existingPermission = await this.permissionsRepository.findOne({ 
        where: { name: updatePermissionDto.name } 
      });
      
      if (existingPermission && existingPermission.id !== id) {
        throw new ConflictException(`Permission with name "${updatePermissionDto.name}" already exists`);
      }
    }

    await this.permissionsRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionsRepository.remove(permission);
  }
}