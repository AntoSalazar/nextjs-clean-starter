# Architecture Guide

This project follows **Clean Architecture** (also known as Hexagonal Architecture or Ports & Adapters), which separates concerns into distinct layers with clear dependency rules.

## Layer Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Next.js App Router, API Routes, React Components)          │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                         │
│  (Use Cases, DTOs, Business Logic Orchestration)             │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                            │
│  (Entities, Interfaces, Business Rules, Errors)              │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                       │
│  (Database, External Services, Security Implementations)     │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Rule

**Dependencies point inward.** Outer layers know about inner layers, but inner layers don't know about outer layers.

- Domain layer has no external dependencies
- Application layer depends on Domain
- Infrastructure implements Domain interfaces
- Presentation depends on Application and Domain

## Layers Explained

### Domain Layer (`src/domain/`)

The core of your application. Contains:

- **Entities**: Business objects with identity and lifecycle
- **Interfaces**: Contracts for repositories and services
- **Errors**: Domain-specific error types

```typescript
// src/domain/entities/User.ts
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  // ...
}

// src/domain/interfaces/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  // ...
}
```

### Application Layer (`src/application/`)

Contains use cases that orchestrate domain logic:

- **Use Cases**: Single-purpose business operations
- **DTOs**: Input/output data structures with validation

```typescript
// src/application/use-cases/auth/LoginUseCase.ts
export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private sessionService: ISessionService,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    // Orchestrate domain logic
  }
}
```

### Infrastructure Layer (`src/infrastructure/`)

Implements the interfaces defined in Domain:

- **Repositories**: Database implementations (Prisma)
- **Services**: External service implementations
- **Config**: Environment configuration

```typescript
// src/infrastructure/database/repositories/PrismaUserRepository.ts
export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.users.findUnique({ where: { id } });
    return user ? mapToDomain(user) : null;
  }
}
```

### Presentation Layer (`src/presentation/`, `src/app/`)

User interface and API layer:

- **Controllers**: Orchestrate use cases
- **API Routes**: HTTP endpoint handlers
- **Components**: React UI components

```typescript
// src/presentation/controllers/AuthController.ts
export class AuthController {
  private loginUseCase: LoginUseCase;

  async login(input: LoginInput): Promise<LoginOutput> {
    return this.loginUseCase.execute(input);
  }
}
```

## Benefits

1. **Testability**: Each layer can be tested in isolation
2. **Maintainability**: Changes are localized to specific layers
3. **Flexibility**: Easy to swap implementations (e.g., different database)
4. **Scalability**: Clear boundaries for team collaboration

## Common Patterns

### Dependency Injection

We use constructor injection for dependencies:

```typescript
class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}
}
```

### Error Handling

Domain errors are thrown and caught at the presentation layer:

```typescript
// Domain
throw AuthenticationError.invalidCredentials();

// API Route
catch (error) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
```

### Data Mapping

Convert between database models and domain entities:

```typescript
function mapToDomain(prismaUser): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    // ...
  };
}
```

## File Naming Conventions

- Interfaces: Prefix with `I` (e.g., `IUserRepository`)
- Use Cases: Suffix with `UseCase` (e.g., `CreateUserUseCase`)
- DTOs: Suffix with `DTO` (e.g., `LoginDTO`)
- Repositories: Suffix with `Repository` (e.g., `PrismaUserRepository`)

## Next Steps

See [FEATURE_DEVELOPMENT.md](./FEATURE_DEVELOPMENT.md) for how to add new features following this architecture.
