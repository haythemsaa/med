#!/bin/bash

# MediCare SaaS - Development Start Script
# This script starts both backend and frontend in development mode

echo "🚀 Starting MediCare in development mode..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ MediCare is running!"
echo "   Backend:  http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:5000/api/v1/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
