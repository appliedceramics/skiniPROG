#!/bin/bash
set -e

echo "Starting skiniPROG CNC Program Fetcher..."

# Create necessary directories
mkdir -p /var/log/supervisor
mkdir -p /app/uploads
mkdir -p /var/lib/postgresql/14/main

# Create node user if it doesn't exist
if ! id "node" &>/dev/null; then
    useradd -r -s /bin/false node
fi

# Set permissions
chown -R node:node /app
chown -R postgres:postgres /var/lib/postgresql

# Initialize PostgreSQL if not already done
if [ ! -f /var/lib/postgresql/14/main/PG_VERSION ]; then
    echo "Initializing PostgreSQL..."
    sudo -u postgres /usr/lib/postgresql/14/bin/initdb -D /var/lib/postgresql/14/main
    
    # Start PostgreSQL temporarily to create database
    sudo -u postgres /usr/lib/postgresql/14/bin/postgres -D /var/lib/postgresql/14/main &
    PG_PID=$!
    
    # Wait for PostgreSQL to start
    sleep 5
    
    # Create database and user
    sudo -u postgres createuser skiniprog
    sudo -u postgres createdb -O skiniprog skiniprog
    sudo -u postgres psql -c "ALTER USER skiniprog WITH PASSWORD 'skiniprog123';"
    
    # Stop temporary PostgreSQL
    kill $PG_PID
    wait $PG_PID
fi

# Run database migrations
cd /app
export DATABASE_URL="postgresql://skiniprog:skiniprog123@localhost:5432/skiniprog"
npm run db:push

echo "Starting services with supervisor..."

# Start all services with supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf