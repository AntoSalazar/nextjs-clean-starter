import type { IUserRepository } from '@/domain/interfaces/repositories/IUserRepository';
import type { IPasswordHasher } from '@/domain/interfaces/services/IPasswordHasher';
import type { CreateUserInput, CreateUserOutput } from '@/application/dto/user/CreateUserDTO';
import { ValidationError } from '@/domain/errors';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // Check if email already exists
    const existingUser = await this.userRepository.existsByEmail(input.email);
    if (existingUser) {
      throw ValidationError.field('email', 'Email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(input.password);

    // Create user
    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: input.role,
      permissions: input.permissions,
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
