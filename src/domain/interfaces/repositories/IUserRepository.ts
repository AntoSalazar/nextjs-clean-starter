import type { User, Role } from '@/domain/entities/User';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName?: string | null;
  role?: Role;
  permissions?: string[];
}

export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  fullName?: string | null;
  role?: Role;
  permissions?: string[];
  isActive?: boolean;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
}
