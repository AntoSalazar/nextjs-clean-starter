import prisma from '../PrismaClient';
import type { User, Role } from '@/domain/entities/User';
import type { IUserRepository, CreateUserInput, UpdateUserInput } from '@/domain/interfaces/repositories/IUserRepository';
import { Role as PrismaRole } from '@prisma/client';

function mapRole(role: PrismaRole): Role {
  return role as unknown as Role;
}

function mapToDomain(data: {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: PrismaRole;
  permissions: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}): User {
  return {
    id: data.id,
    email: data.email,
    passwordHash: data.password_hash,
    fullName: data.full_name,
    role: mapRole(data.role),
    permissions: data.permissions,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { id } });
    return user ? mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { email } });
    return user ? mapToDomain(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.users.findMany({
      orderBy: { created_at: 'desc' },
    });
    return users.map(mapToDomain);
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.users.create({
      data: {
        email: input.email,
        password_hash: input.passwordHash,
        full_name: input.fullName ?? null,
        role: (input.role as unknown as PrismaRole) ?? 'user',
        permissions: input.permissions ?? [],
      },
    });
    return mapToDomain(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await prisma.users.update({
      where: { id },
      data: {
        ...(input.email !== undefined && { email: input.email }),
        ...(input.passwordHash !== undefined && { password_hash: input.passwordHash }),
        ...(input.fullName !== undefined && { full_name: input.fullName }),
        ...(input.role !== undefined && { role: input.role as unknown as PrismaRole }),
        ...(input.permissions !== undefined && { permissions: input.permissions }),
        ...(input.isActive !== undefined && { is_active: input.isActive }),
      },
    });
    return mapToDomain(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.users.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.users.count({ where: { email } });
    return count > 0;
  }
}
