import type { IUserRepository } from '@/domain/interfaces/repositories/IUserRepository';
import type { UserPublic } from '@/domain/entities/User';
import { toUserPublic } from '@/domain/entities/User';
import { NotFoundError } from '@/domain/errors';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserPublic> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw NotFoundError.user(userId);
    }
    return toUserPublic(user);
  }

  async executeAll(): Promise<UserPublic[]> {
    const users = await this.userRepository.findAll();
    return users.map(toUserPublic);
  }
}
