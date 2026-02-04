import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '@/application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '@/application/use-cases/auth/RefreshTokenUseCase';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';
import { PrismaRefreshTokenRepository } from '@/infrastructure/database/repositories/PrismaRefreshTokenRepository';
import { JWTSessionService } from '@/infrastructure/security/JWTSessionService';
import { BcryptPasswordHasher } from '@/infrastructure/security/BcryptPasswordHasher';
import type { LoginInput, LoginOutput } from '@/application/dto/auth/LoginDTO';
import type { RefreshTokenOutput } from '@/application/use-cases/auth/RefreshTokenUseCase';

export class AuthController {
  private readonly loginUseCase: LoginUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;

  constructor() {
    const userRepository = new PrismaUserRepository();
    const refreshTokenRepository = new PrismaRefreshTokenRepository();
    const sessionService = new JWTSessionService();
    const passwordHasher = new BcryptPasswordHasher();

    this.loginUseCase = new LoginUseCase(
      userRepository,
      refreshTokenRepository,
      sessionService,
      passwordHasher
    );

    this.logoutUseCase = new LogoutUseCase(refreshTokenRepository, sessionService);

    this.refreshTokenUseCase = new RefreshTokenUseCase(
      userRepository,
      refreshTokenRepository,
      sessionService
    );
  }

  async login(input: LoginInput): Promise<LoginOutput> {
    return this.loginUseCase.execute(input);
  }

  async logout(refreshToken: string): Promise<void> {
    return this.logoutUseCase.execute(refreshToken);
  }

  async logoutAllSessions(userId: string): Promise<void> {
    return this.logoutUseCase.executeForUser(userId);
  }

  async refreshToken(refreshToken: string, rotate = false): Promise<RefreshTokenOutput> {
    return this.refreshTokenUseCase.execute(refreshToken, rotate);
  }
}
