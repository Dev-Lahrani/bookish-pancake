#!/bin/bash

# AI Plagiarism Detector & Humanizer - Quick Start Script

echo "🚀 AI Plagiarism Detector & Humanizer - Quick Start"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your API keys:"
    echo "   - OPENAI_API_KEY or ANTHROPIC_API_KEY"
    echo ""
    read -p "Press Enter to continue after adding API keys..."
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Dependency installation failed"
    exit 1
fi

echo ""
echo "🔨 Building shared types..."
npm run build --workspace=shared

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Make sure your API key is set in .env file"
echo "   2. Run: npm run dev"
echo "   3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Read README.md for full documentation"
echo ""
