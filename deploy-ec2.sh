#!/bin/bash

# EC2 Deployment Script for React Application
# This script automates the deployment process

echo "🚀 Starting EC2 Deployment Process..."

# Step 1: Build the application
echo "📦 Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
tar -czf dist.tar.gz dist/

echo "✅ Deployment package created: dist.tar.gz"

echo ""
echo "📋 Next Steps:"
echo "1. Upload dist.tar.gz to your EC2 instance"
echo "2. SSH into your EC2 instance"
echo "3. Extract and configure the application"
echo ""
echo "Commands to run on EC2:"
echo "  tar -xzf dist.tar.gz"
echo "  sudo cp -r dist/* /var/www/html/"
echo "  sudo systemctl restart nginx"
echo ""
echo "✅ Deployment package ready!"
