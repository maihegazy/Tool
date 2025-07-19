#!/bin/bash

# RFQ Tool Setup Script
echo "🚀 Setting up RFQ Planning Tool for company deployment..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database
mkdir -p src/app/api/rfqs/[id]
mkdir -p src/app/api/settings
mkdir -p src/components
mkdir -p src/lib

# Install dependencies
echo "📦 Installing dependencies..."
npm install sqlite3 sqlite lucide-react

# Create .env.local for configuration
echo "⚙️ Creating configuration files..."
cat > .env.local << EOF
# Database configuration
DB_PATH=./database/rfq.db

# Server configuration
PORT=3000

# Optional: Basic auth (uncomment to enable)
# AUTH_USERNAME=admin
# AUTH_PASSWORD=your_secure_password
EOF

# Create database directory with proper permissions
echo "🗄️ Setting up database..."
chmod 755 database

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your component files to the src/ directories"
echo "2. Test locally: npm run dev"
echo "3. Deploy to your company server"
echo ""
echo "🌐 To access from other devices on the network:"
echo "   npm run dev -- -H 0.0.0.0"
echo ""
echo "📊 Database will be created at: database/rfq.db"
echo "⚡ Application will run on: http://localhost:3000"