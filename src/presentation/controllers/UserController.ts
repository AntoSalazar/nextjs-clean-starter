import { CreateUserUseCase } from '@/application/use-cases/user/CreateUserUseCase';
import { GetUserUseCase } from '@/application/use-cases/user/GetUserUseCase';
import { UpdateUserUseCase } from '@/application/use-cases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '@/application/use-cases/user/DeleteUserUseCase';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '@/infrastructure/security/BcryptPasswordHasher';
import type { CreateUserInput, CreateUserOutput } from '@/application/dto/user/CreateUserDTO';
import type { UpdateUserInput, UpdateUserOutput } from '@/application/dto/user/UpdateUserDTO';
import type { UserPublic } from '@/domain/entities/User';

export class UserController {
  private readonly createUserUseCase: CreateUserUseCase;
  private readonly getUserUseCase: GetUserUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly deleteUserUseCase: DeleteUserUseCase;

  constructor() {
    const userRepository = new PrismaUserRepository();
    const passwordHasher = new BcryptPasswordHasher();

    this.createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository, passwordHasher);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
  }

  async createUser(input: CreateUserInput): Promise<CreateUserOutput> {
    return this.createUserUseCase.execute(input);
  }

  async getUser(userId: string): Promise<UserPublic> {
    return this.getUserUseCase.execute(userId);
  }

  async getAllUsers(): Promise<UserPublic[]> {
    return this.getUserUseCase.executeAll();
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<UpdateUserOutput> {
    return this.updateUserUseCase.execute(userId, input);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.deleteUserUseCase.execute(userId);
  }
}
