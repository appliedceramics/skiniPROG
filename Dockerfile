# Use Ubuntu as base image
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=20
ENV POSTGRES_VERSION=14

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg2 \
    software-properties-common \
    nginx \
    postgresql-$POSTGRES_VERSION \
    postgresql-client-$POSTGRES_VERSION \
    postgresql-contrib-$POSTGRES_VERSION \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - \
    && apt-get install -y nodejs

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create nginx configuration
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Create supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create PostgreSQL initialization script
COPY docker/init-db.sh /docker-entrypoint-initdb.d/

# Create startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports
EXPOSE 80 5432

# Create volumes for data persistence
VOLUME ["/var/lib/postgresql/data", "/app/uploads"]

# Start services
CMD ["/start.sh"]