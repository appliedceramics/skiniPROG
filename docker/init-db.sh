#!/bin/bash
set -e

# Initialize PostgreSQL for skiniPROG
echo "Initializing PostgreSQL database for skiniPROG..."

# Start PostgreSQL service
service postgresql start

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Create database and user
sudo -u postgres psql -c "CREATE USER skiniprog WITH PASSWORD 'skiniprog123';"
sudo -u postgres psql -c "CREATE DATABASE skiniprog OWNER skiniprog;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE skiniprog TO skiniprog;"

echo "PostgreSQL initialization completed!"