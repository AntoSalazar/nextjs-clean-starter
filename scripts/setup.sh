#!/bin/bash

set -e

echo "🚀 Setting up Next.js Clean Architecture Starter Kit"
echo ""

# Check for Bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install it first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun found: $(bun --version)"

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need to set up PostgreSQL manually."
else
    echo "✅ Docker found: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
fi

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your settings."
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run prisma:generate

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Start PostgreSQL: docker compose -f docker-compose.dev.yml up -d postgres"
echo "3. Run migrations: bun run prisma:migrate:dev"
echo "4. Seed the database: bun run db:seed"
echo "5. Start the app: bun run dev"
echo ""
echo "Default login: admin@example.com / admin123"
