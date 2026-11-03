#!/bin/bash

echo "🚀 RENSELL - Razorpay Integration Setup"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  IMPORTANT: Update .env.local with your credentials:"
    echo "   1. MongoDB URI"
    echo "   2. JWT Secret"
    echo "   3. Razorpay API Keys"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Get Razorpay API keys from: https://dashboard.razorpay.com"
echo "   2. Update .env.local with your keys"
echo "   3. Set up MongoDB Atlas: https://cloud.mongodb.com"
echo "   4. Run: npm run dev"
echo "   5. Visit: http://localhost:3000"
echo ""
echo "📖 Read RAZORPAY_INTEGRATION.md for detailed guide"
echo ""
