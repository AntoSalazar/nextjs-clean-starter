import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
  };
}
