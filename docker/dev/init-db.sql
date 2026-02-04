-- Development database initialization
-- This runs when the postgres container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The database is created automatically via POSTGRES_DB env var
-- Prisma migrations will handle table creation
