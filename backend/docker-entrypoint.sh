#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Running database seed (if needed)..."
npx prisma db seed || echo "Seed already applied or failed (continuing anyway)"

echo "Starting application..."
exec "$@"
