import { z } from 'zod';
import { Role } from '@/domain/entities/User';

export const UpdateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  fullName: z.string().min(1, 'Full name is required').optional().nullable(),
  role: z.nativeEnum(Role).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export interface UpdateUserOutput {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  permissions: string[];
  isActive: boolean;
  updatedAt: Date;
}
