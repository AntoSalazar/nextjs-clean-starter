export class AuthenticationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string = 'Authentication failed', code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = 401;
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }

  static invalidCredentials(): AuthenticationError {
    return new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  static tokenExpired(): AuthenticationError {
    return new AuthenticationError('Token has expired', 'TOKEN_EXPIRED');
  }

  static tokenInvalid(): AuthenticationError {
    return new AuthenticationError('Invalid token', 'TOKEN_INVALID');
  }

  static userInactive(): AuthenticationError {
    return new AuthenticationError('User account is inactive', 'USER_INACTIVE');
  }

  static refreshTokenInvalid(): AuthenticationError {
    return new AuthenticationError('Invalid refresh token', 'REFRESH_TOKEN_INVALID');
  }

  static refreshTokenExpired(): AuthenticationError {
    return new AuthenticationError('Refresh token has expired', 'REFRESH_TOKEN_EXPIRED');
  }

  static apiKeyInvalid(): AuthenticationError {
    return new AuthenticationError('Invalid API key', 'API_KEY_INVALID');
  }

  static apiKeyExpired(): AuthenticationError {
    return new AuthenticationError('API key has expired', 'API_KEY_EXPIRED');
  }
}
