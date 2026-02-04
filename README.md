<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bun-1.1-f9f1e1?style=for-the-badge&logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</p>

<h1 align="center">Next.js Clean Architecture Starter</h1>

<p align="center">
  A production-ready Next.js starter kit featuring <strong>Clean Architecture</strong>, JWT authentication, API keys, and Docker support.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-reference">API</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## Features

- **Next.js 15+** with App Router and Turbopack
- **Bun** runtime for blazing fast performance
- **Clean Architecture** (Hexagonal) with clear separation of concerns
- **JWT Authentication** with access tokens and refresh tokens
- **API Keys** for programmatic access
- **PostgreSQL** with Prisma ORM
- **shadcn/ui** components with Tailwind CSS
- **Docker Compose** for development and production
- **Coolify-ready** for easy self-hosting
- **Email support** with Resend (optional)

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.1+
- [Docker](https://docker.com) & Docker Compose
- PostgreSQL 16+ (or use Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nextjs-clean-starter.git
cd nextjs-clean-starter

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Start PostgreSQL (using Docker)
docker compose -f docker-compose.dev.yml up -d postgres

# Run database migrations
bun run prisma:migrate:dev

# Seed the admin user
bun run db:seed

# Start the development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with:

- **Email:** `admin@example.com`
- **Password:** `admin123`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login)
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── application/           # APPLICATION LAYER
│   ├── use-cases/         # Business logic
│   └── dto/               # Data transfer objects
├── domain/                # DOMAIN LAYER (Core)
│   ├── entities/          # Domain entities
│   ├── interfaces/        # Repository & service contracts
│   └── errors/            # Domain errors
├── infrastructure/        # INFRASTRUCTURE LAYER
│   ├── config/            # Configuration
│   ├── database/          # Prisma repositories
│   ├── security/          # JWT, password hashing
│   └── services/          # External services
├── presentation/          # PRESENTATION LAYER
│   ├── controllers/       # Business orchestration
│   └── middleware/        # Auth middleware
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── dashboard/        # Dashboard components
└── lib/                  # Utilities
```

## Architecture

This project follows **Clean Architecture** principles:

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

**Key principle:** Dependencies point inward. Outer layers know about inner layers, but inner layers don't know about outer layers.

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for more details.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with Turbopack |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript check |
| `bun run prisma:migrate:dev` | Run migrations (dev) |
| `bun run prisma:migrate:deploy` | Run migrations (prod) |
| `bun run prisma:studio` | Open Prisma Studio |
| `bun run db:seed` | Seed admin user |
| `bun run db:reset` | Reset database |

## API Reference

### Authentication

> **Interactive Documentation**: Access the full interactive API documentation at [http://localhost:3000/docs](http://localhost:3000/docs).

All protected endpoints require a `Bearer` token:

```bash
# Using JWT access token
curl -H "Authorization: Bearer <access_token>" http://localhost:3000/api/auth/me

# Using API key
curl -H "Authorization: Bearer sk_<api_key>" http://localhost:3000/api/auth/me
```

### Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Login | Public |
| `POST` | `/api/auth/logout` | Logout | Cookie |
| `POST` | `/api/auth/refresh` | Refresh token | Cookie |
| `GET` | `/api/auth/me` | Get current user | Bearer |
| `GET` | `/api/admin/users` | List users | Admin |
| `POST` | `/api/admin/users` | Create user | Admin |
| `GET` | `/api/admin/users/:id` | Get user | Admin |
| `PUT` | `/api/admin/users/:id` | Update user | Admin |
| `DELETE` | `/api/admin/users/:id` | Delete user | Admin |
| `GET` | `/api/api-keys` | List API keys | Bearer |
| `POST` | `/api/api-keys` | Create API key | Bearer |
| `DELETE` | `/api/api-keys/:id` | Revoke API key | Bearer |
| `GET` | `/api/health` | Health check | Public |

See [docs/API.md](./docs/API.md) for detailed documentation.

## Docker

### Development

```bash
# Start all services (PostgreSQL, pgAdmin, App)
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f app
```

Access:
- **App:** http://localhost:3000
- **pgAdmin:** http://localhost:5050

### Production

```bash
# Build and start
docker compose -f docker-compose.prod.yml up -d --build
```

## Deployment

### Coolify

1. Connect your repository in Coolify
2. Select **Docker Compose** as build pack
3. Set `docker-compose.prod.yml` as the compose file
4. Configure environment variables
5. Deploy

### Manual Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing (32+ chars) | Yes |
| `JWT_EXPIRES_IN` | Access token expiration (e.g., `15m`) | No |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration (e.g., `7d`) | No |
| `ADMIN_EMAIL` | Admin user email for seeding | No |
| `ADMIN_PASSWORD` | Admin user password for seeding | No |
| `RESEND_API_KEY` | Resend API key (optional) | No |

See [.env.example](./.env.example) for all options.

## Adding New Features

This starter follows Clean Architecture. To add a new feature:

1. **Domain Layer:** Define entities and repository interfaces
2. **Infrastructure Layer:** Implement repositories with Prisma
3. **Application Layer:** Create use cases and DTOs
4. **Presentation Layer:** Add API routes and controllers

See [docs/FEATURE_DEVELOPMENT.md](./docs/FEATURE_DEVELOPMENT.md) for a step-by-step guide.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 15](https://nextjs.org/) |
| Runtime | [Bun](https://bun.sh/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Auth | [jose](https://github.com/panva/jose) (JWT) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Components | [shadcn/ui](https://ui.shadcn.com/) |
| Validation | [Zod](https://zod.dev/) |
| Email | [Resend](https://resend.com/) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ using Next.js and Clean Architecture
</p>
