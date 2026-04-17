#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use correct Node version
nvm use

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Please copy .env.example to .env and fill in your credentials:"
    echo "  cp .env.example .env"
    echo ""
    exit 1
fi

echo "🚀 Starting development servers..."
echo ""
echo "📦 Backend will run on http://localhost:3001"
echo "⚛️  Frontend will run on http://localhost:3000"
echo "🔧 Admin panel at http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
cd client && npm start

# When frontend stops, kill backend too
kill $BACKEND_PID
