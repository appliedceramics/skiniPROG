# skiniPROG CNC Program Fetcher - Docker Deployment Guide

## 🚀 Quick Start

Deploy your skiniPROG application on any Ubuntu server with Docker in minutes!

### Prerequisites
- Ubuntu 20.04 or newer
- Docker and Docker Compose installed
- At least 2GB RAM and 10GB disk space

### Installation

1. **Clone or copy your project files** to your Ubuntu server
2. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

That's it! Your skiniPROG CNC Program Fetcher will be available at:
- **Web Interface:** http://your-server-ip
- **Database:** localhost:5432 (internal)

## 📋 What's Included

✅ **Complete Application Stack:**
- React frontend with responsive design
- Node.js/Express backend with SMB functionality
- PostgreSQL database with persistent storage
- Nginx reverse proxy with security headers

✅ **Security Features:**
- Admin password protection (Hfix4ACC)
- Manager password protection ($isak044) 
- Folder selection security controls
- File upload restrictions

✅ **Professional Branding:**
- Motava Corporation footer
- Blitz logo integration
- skiniPROG custom styling

## 🔧 Configuration

### Environment Variables
The container automatically configures:
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://skiniprog:skiniprog123@localhost:5432/skiniprog`
- PostgreSQL credentials

### Data Persistence
Your data is stored in Docker volumes:
- `postgres_data` - Database files
- `uploads_data` - Uploaded files

### Ports
- **Port 80** - Web application (HTTP)
- **Port 5432** - PostgreSQL (internal only)

## 🛠️ Management Commands

### Start/Stop Services
```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

### Database Management
```bash
# Access database directly
docker-compose exec skiniprog psql -U skiniprog -d skiniprog

# Backup database
docker-compose exec skiniprog pg_dump -U skiniprog skiniprog > backup.sql

# Restore database
docker-compose exec -T skiniprog psql -U skiniprog -d skiniprog < backup.sql
```

### Updates
```bash
# Pull latest changes and rebuild
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Security Notes

- Change default database passwords in production
- Use HTTPS with SSL certificates for external access
- Configure firewall rules appropriately
- Regular backups recommended

## 📞 Support

For deployment issues or customization needs, contact your development team.

**Product of Motava Corporation | www.motava.com**