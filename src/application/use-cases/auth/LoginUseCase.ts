import type { IUserRepository } from '@/domain/interfaces/repositories/IUserRepository';
import type { IRefreshTokenRepository } from '@/domain/interfaces/repositories/IRefreshTokenRepository';
import type { ISessionService } from '@/domain/interfaces/services/ISessionService';
import type { IPasswordHasher } from '@/domain/interfaces/services/IPasswordHasher';
import type { LoginInput, LoginOutput } from '@/application/dto/auth/LoginDTO';
import { AuthenticationError } from '@/domain/errors';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly sessionService: ISessionService,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw AuthenticationError.invalidCredentials();
    }

    // Check if user is active
    if (!user.isActive) {
      throw AuthenticationError.userInactive();
    }

    // Verify password
    const isValidPassword = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw AuthenticationError.invalidCredentials();
    }

    // Create access token
    const accessToken = await this.sessionService.createAccessToken(user);
    const accessTokenExpiresAt = this.sessionService.getAccessTokenExpiry();

    // Create refresh token
    const { token: refreshToken, hash: refreshTokenHash } = await this.sessionService.createRefreshToken();
    const refreshTokenExpiresAt = this.sessionService.getRefreshTokenExpiry();

    // Store refresh token in database
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
