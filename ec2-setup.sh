#!/bin/bash

# EC2 Server Setup Script
# Run this script on your EC2 instance to set up the environment

echo "🔧 Setting up EC2 instance for React application..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y

# Install Node.js (if needed for SSR or API)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Create web directory
echo "📁 Creating web directory..."
sudo mkdir -p /var/www/html
sudo chown -R $USER:$USER /var/www/html

# Configure Nginx for React SPA
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/react-app > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name _;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Disable caching for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/react-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo "✅ Nginx restarted and enabled"
else
    echo "❌ Nginx configuration has errors"
    exit 1
fi

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo ""
echo "✅ EC2 setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your dist.tar.gz file to this server"
echo "2. Extract: tar -xzf dist.tar.gz"
echo "3. Deploy: sudo cp -r dist/* /var/www/html/"
echo "4. Restart Nginx: sudo systemctl restart nginx"
echo ""
echo "🌐 Your application will be available at: http://$(curl -s ifconfig.me)"
