Perfect! I have all the details needed. Here are the complete deployment instructions for your IT team:

skiniPROG Deployment Instructions for Ubuntu Server
Server: ubuntu_fb (Internal IP: 10.0.30.228)
Domain: skiniprog.blitz.ac
Repository: https://github.com/appliedceramics/skiniPROG.git

Prerequisites Installation
# Update system
sudo apt update && sudo apt upgrade -y
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
# Install Git and other utilities
sudo apt install git pwgen -y
# Verify installations
node --version
npm --version
psql --version
1. Clone and Setup Project
# Navigate to web directory
cd /var/www
# Clone the repository
sudo git clone https://github.com/appliedceramics/skiniPROG.git
sudo chown -R $USER:$USER skiniprog
cd skiniprog
# Install dependencies
npm install
2. Database Setup with Auto-Generated Password
# Generate secure database password
DB_PASSWORD=$(pwgen -s 32 1)
echo "Generated database password: $DB_PASSWORD"
echo "SAVE THIS PASSWORD: $DB_PASSWORD" > db_credentials.txt
# Switch to postgres user and create database
sudo -u postgres psql << EOF
CREATE DATABASE skiniprog;
CREATE USER skiniprog_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE skiniprog TO skiniprog_user;
ALTER USER skiniprog_user CREATEDB;
\q
EOF
3. Environment Configuration
# Create environment file
cat > .env << EOF
DATABASE_URL=postgresql://skiniprog_user:$DB_PASSWORD@localhost:5432/skiniprog
PGHOST=localhost
PGPORT=5432
PGDATABASE=skiniprog
PGUSER=skiniprog_user
PGPASSWORD=$DB_PASSWORD
NODE_ENV=production
PORT=3000
EOF
# Secure the environment file
chmod 600 .env
4. Database Schema Setup
# Push database schema
npm run db:push
5. Build Application
# Build for production
npm run build
6. Install and Configure PM2
# Install PM2 globally
sudo npm install -g pm2
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'skiniprog',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/skiniprog',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF
7. Configure Nginx for skiniprog.blitz.ac
# Create Nginx site configuration
sudo tee /etc/nginx/sites-available/skiniprog << EOF
server {
    listen 80;
    server_name skiniprog.blitz.ac;
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name skiniprog.blitz.ac;
    # SSL Configuration (certificates should be managed with main Blitz domain)
    ssl_certificate /path/to/blitz.ac/fullchain.pem;
    ssl_certificate_key /path/to/blitz.ac/privkey.pem;
    
    # SSL Security Headers for iframe compatibility
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    # Headers for iframe compatibility with Gepard
    add_header X-Frame-Options "ALLOWALL";
    add_header Content-Security-Policy "frame-ancestors *";
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Additional headers for iframe support
        proxy_set_header X-Frame-Options "ALLOWALL";
    }
}
EOF
# Enable the site
sudo ln -s /etc/nginx/sites-available/skiniprog /etc/nginx/sites-enabled/
# Test Nginx configuration
sudo nginx -t
# Reload Nginx
sudo systemctl reload nginx
8. SSL Certificate Setup
# Add skiniprog.blitz.ac to existing Blitz SSL certificate
# Update the certificate to include the new subdomain
# This should be coordinated with existing Blitz SSL management
# If using Let's Encrypt with existing Blitz setup:
# sudo certbot --nginx -d blitz.ac -d skiniprog.blitz.ac
9. Start Application
# Start application with PM2
pm2 start ecosystem.config.js
# Save PM2 configuration
pm2 save
# Setup PM2 to start on boot
pm2 startup
# Follow the command provided by PM2 startup
# Check application status
pm2 status
pm2 logs skiniprog
10. Firewall Configuration
# Ensure HTTPS traffic is allowed (should already be configured for Blitz)
sudo ufw status
# Verify ports 80 and 443 are open
11. DNS Configuration
Add DNS record for skiniprog.blitz.ac:

Type: A Record
Name: skiniprog
Value: 10.0.30.228 (or external IP if different)
TTL: 300
12. Application Passwords
The application uses these default passwords:

Administrator Password: Hfix4ACC
Manager Password: $isak044
These are used within the application for:

Settings access (admin password)
Upload/folder creation operations (manager password)
13. Verification Steps
# Check if application is running
curl -I http://localhost:3000
# Check PM2 status
pm2 status
# Check Nginx configuration
sudo nginx -t
# View application logs
pm2 logs skiniprog --lines 50
14. Testing Access
Internal Access: http://10.0.30.228:3000
Domain Access: https://skiniprog.blitz.ac
iframe Test: Verify it loads properly within Gepard interface
Maintenance Commands
# Update application (when new changes are pushed)
cd /var/www/skiniprog
git pull
npm install
npm run build
pm2 restart skiniprog
# View logs
pm2 logs skiniprog
# Check database credentials
cat db_credentials.txt
Important Notes
SSL Certificate: Coordinate with existing Blitz SSL certificate management
iframe Compatibility: Configuration includes headers for Gepard iframe integration
Database Password: Automatically generated password is saved in db_credentials.txt
Internal Network: Application accessible on internal IP 10.0.30.228
Domain Access: Will be available at https://skiniprog.blitz.ac after DNS propagation
The application will be ready for iframe integration with the Gepard system once deployment is complete.
