#!/bin/bash

# Quick Deployment Script for EC2
# Configure these variables before running

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================
EC2_IP="YOUR_EC2_PUBLIC_IP"           # e.g., "13.201.79.93"
KEY_FILE="YOUR_KEY_FILE.pem"          # e.g., "mykey.pem"
EC2_USER="ubuntu"                      # Usually "ubuntu" for Ubuntu, "ec2-user" for Amazon Linux

# ============================================
# DEPLOYMENT SCRIPT - DO NOT EDIT BELOW
# ============================================

echo "🚀 Starting deployment to EC2..."

# Check if configuration is set
if [ "$EC2_IP" = "YOUR_EC2_PUBLIC_IP" ]; then
    echo "❌ Error: Please configure EC2_IP in the script"
    exit 1
fi

if [ "$KEY_FILE" = "YOUR_KEY_FILE.pem" ]; then
    echo "❌ Error: Please configure KEY_FILE in the script"
    exit 1
fi

# Check if key file exists
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: Key file '$KEY_FILE' not found"
    exit 1
fi

# Step 1: Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
tar -czf dist.tar.gz dist/

if [ $? -ne 0 ]; then
    echo "❌ Failed to create package"
    exit 1
fi

echo "✅ Package created: dist.tar.gz"

# Step 3: Upload to EC2
echo "📤 Uploading to EC2 ($EC2_IP)..."
scp -i "$KEY_FILE" -o StrictHostKeyChecking=no dist.tar.gz $EC2_USER@$EC2_IP:~/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed! Check your EC2 IP, key file, and network connection."
    exit 1
fi

echo "✅ Upload successful!"

# Step 4: Deploy on EC2
echo "🚀 Deploying on EC2..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no $EC2_USER@$EC2_IP << 'ENDSSH'
echo "📦 Extracting files..."
tar -xzf dist.tar.gz

echo "📁 Deploying to web directory..."
sudo cp -r dist/* /var/www/html/

echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "🧹 Cleaning up..."
rm -rf dist dist.tar.gz

echo "✅ Deployment complete on server!"
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed on EC2"
    exit 1
fi

# Step 5: Cleanup local files
echo "🧹 Cleaning up local files..."
rm dist.tar.gz

echo ""
echo "✅ ============================================"
echo "✅ Deployment completed successfully!"
echo "✅ ============================================"
echo ""
echo "🌐 Your application is now live at:"
echo "   http://$EC2_IP"
echo ""
echo "📋 Useful commands:"
echo "   Check status: ssh -i $KEY_FILE $EC2_USER@$EC2_IP 'sudo systemctl status nginx'"
echo "   View logs:    ssh -i $KEY_FILE $EC2_USER@$EC2_IP 'sudo tail -f /var/log/nginx/error.log'"
echo ""
