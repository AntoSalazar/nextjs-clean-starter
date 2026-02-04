import type { IUserRepository } from '@/domain/interfaces/repositories/IUserRepository';
import { NotFoundError } from '@/domain/errors';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    // Check if user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw NotFoundError.user(userId);
    }

    // Delete user (cascades to refresh tokens and API keys via Prisma)
    await this.userRepository.delete(userId);
  }
}
