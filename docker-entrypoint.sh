#!/bin/sh
set -e

echo "=== Docker Entrypoint ==="

# Run database migrations if enabled
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  bunx prisma migrate deploy
  echo "Migrations complete."
fi

# Run seed script if enabled
if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "Running seed script..."
  bun run src/infrastructure/database/seeds/create-admin.ts || echo "Seed already exists or failed (this is usually OK)"
  echo "Seed complete."
fi

echo "Starting application..."
exec "$@"
