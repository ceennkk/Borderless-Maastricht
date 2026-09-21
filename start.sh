#!/bin/bash

echo "🚀 Starting Borderless Local Environment..."
echo "----------------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js (https://nodejs.org/) to run this app."
    exit 1
fi

echo "📦 1. Checking dependencies..."
npm install

echo "🌐 2. Starting Next.js development server..."
echo "👉 The application will open automatically in your browser."

# Wait a few seconds for the server to start, then open the browser
(sleep 3 && (open http://localhost:3000 || xdg-open http://localhost:3000 || start http://localhost:3000) > /dev/null 2>&1) &

# Start the dev server
npm run dev
