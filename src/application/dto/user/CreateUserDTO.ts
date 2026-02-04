import { z } from 'zod';
import { Role } from '@/domain/entities/User';

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required').optional(),
  role: z.nativeEnum(Role).optional().default(Role.USER),
  permissions: z.array(z.string()).optional().default([]),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export interface CreateUserOutput {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
}
