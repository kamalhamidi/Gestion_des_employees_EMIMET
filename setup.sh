#!/bin/bash

# EMIMET Employee Management - Setup Script

echo "🚀 EMIMET Employee Management System Setup"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file from .env.example and configure your database URL"
    exit 1
fi

# Check if DATABASE_URL is configured
if grep -q "postgresql://user:password@localhost" .env; then
    echo "⚠️  DATABASE_URL needs to be configured in .env file"
    echo ""
    echo "Please update DATABASE_URL in .env with your PostgreSQL connection string:"
    echo "  DATABASE_URL=\"postgresql://username:password@localhost:5432/emimet_db\""
    echo ""
    echo "Options for PostgreSQL:"
    echo "  1. Local: Install PostgreSQL locally"
    echo "  2. Docker: docker run --name emimet-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres"
    echo "  3. Cloud: Use Supabase, Neon, or Railway"
    echo ""
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
npm run prisma:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now start the development server:"
echo "   npm run dev"
echo ""
echo "🔑 Demo credentials:"
echo "   Email: admin@emimet.com"
echo "   Password: admin123"
echo ""
