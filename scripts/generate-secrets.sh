#!/bin/bash

# Generate secure secrets for production

echo "Generating secure secrets..."
echo ""

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"

# Postgres Password
POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '/' | cut -c1-24)
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"

# Admin Password
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '/' | cut -c1-16)
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"

echo ""
echo "Copy these values to your .env file"
