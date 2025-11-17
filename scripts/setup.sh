#!/bin/bash

# MediCare SaaS - Setup Script
# This script sets up the development environment

echo "🏥 MediCare SaaS - Setup Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18.x or higher${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL CLI not detected. Make sure PostgreSQL is installed and running${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL detected${NC}"
fi

# Backend setup
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Copy .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update the .env file with your configuration${NC}"
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Frontend setup
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Copy .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run 'npm run db:migrate' in the backend directory to setup the database"
echo "3. Run 'npm run dev' to start the backend server"
echo "4. Run 'npm start' in the frontend directory to start the React app"
echo ""
echo "📚 See INSTALLATION.md for detailed instructions"
