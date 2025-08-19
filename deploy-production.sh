#!/bin/bash

# Production Deployment Script for ToolzHub
# This script builds and deploys the application to Firebase

set -e  # Exit on any error

echo "🚀 Starting production deployment for ToolzHub..."

# Check if required environment variables are set
if [ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then
    echo "❌ Error: VITE_STRIPE_PUBLISHABLE_KEY is not set"
    echo "Please set your production Stripe publishable key"
    exit 1
fi

if [ -z "$VITE_STRIPE_PRO_PRICE_ID" ]; then
    echo "❌ Error: VITE_STRIPE_PRO_PRICE_ID is not set"
    echo "Please set your production Stripe price ID"
    exit 1
fi

# Validate Stripe keys are production keys
if [[ $VITE_STRIPE_PUBLISHABLE_KEY == pk_test_* ]]; then
    echo "⚠️  Warning: Using test Stripe keys in production deployment"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Environment variables validated"

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Build Firebase functions
echo "🔨 Building Firebase functions..."
cd functions
npm run build
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting,functions

echo "✅ Production deployment completed!"
echo ""
echo "🎉 Your application is now live!"
echo "🔗 Visit: https://toolzhub-5014-31157.web.app"
echo ""
echo "📋 Post-deployment checklist:"
echo "- Test the 'Upgrade to Pro' buttons"
echo "- Verify Stripe checkout workflow"
echo "- Check Firebase Functions logs"
echo "- Test QR code generation"
echo ""
echo "📊 Monitor your deployment:"
echo "- Firebase Console: https://console.firebase.google.com/project/toolzhub-5014-31157"
echo "- Stripe Dashboard: https://dashboard.stripe.com"
