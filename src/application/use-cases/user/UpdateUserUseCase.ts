import type { IUserRepository } from '@/domain/interfaces/repositories/IUserRepository';
import type { IPasswordHasher } from '@/domain/interfaces/services/IPasswordHasher';
import type { UpdateUserInput, UpdateUserOutput } from '@/application/dto/user/UpdateUserDTO';
import { NotFoundError, ValidationError } from '@/domain/errors';

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(userId: string, input: UpdateUserInput): Promise<UpdateUserOutput> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw NotFoundError.user(userId);
    }

    // Check if email is being changed and if it already exists
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await this.userRepository.existsByEmail(input.email);
      if (emailExists) {
        throw ValidationError.field('email', 'Email already exists');
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      passwordHash?: string;
      fullName?: string | null;
      role?: typeof input.role;
      permissions?: string[];
      isActive?: boolean;
    } = {};

    if (input.email !== undefined) {
      updateData.email = input.email;
    }
    if (input.password !== undefined) {
      updateData.passwordHash = await this.passwordHasher.hash(input.password);
    }
    if (input.fullName !== undefined) {
      updateData.fullName = input.fullName;
    }
    if (input.role !== undefined) {
      updateData.role = input.role;
    }
    if (input.permissions !== undefined) {
      updateData.permissions = input.permissions;
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    // Update user
    const user = await this.userRepository.update(userId, updateData);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    };
  }
}
