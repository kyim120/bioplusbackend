#!/bin/bash

# BioPlus Production Health Check Script

echo "🏥 BioPlus Production Health Check"
echo "===================================="
echo ""

# Check if backend is running
echo "📡 Checking backend server..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is running"
    curl -s http://localhost:5000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:5000/health
else
    echo "❌ Backend is not responding"
fi

echo ""

# Check MongoDB
echo "🗄️  Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
fi

echo ""

# Check PM2 status
echo "⚙️  Checking PM2 processes..."
if command -v pm2 &> /dev/null; then
    pm2 list | grep bioplus-api
else
    echo "⚠️  PM2 not found"
fi

echo ""

# Check environment variables
echo "🔧 Checking environment..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check critical variables (without showing values)
    if grep -q "MONGODB_URI" .env; then
        echo "✅ MONGODB_URI configured"
    else
        echo "❌ MONGODB_URI missing"
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo "✅ JWT_SECRET configured"
    else
        echo "❌ JWT_SECRET missing"
    fi
    
    if grep -q "CORS_ORIGIN" .env; then
        echo "✅ CORS_ORIGIN configured"
    else
        echo "❌ CORS_ORIGIN missing"
    fi
else
    echo "❌ .env file not found"
fi

echo ""
echo "=================================="
echo "Health check complete!"
