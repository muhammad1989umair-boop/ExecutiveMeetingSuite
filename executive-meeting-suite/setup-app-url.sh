#!/bin/bash

# Setup Script: Configure APP_URL for Deployment

echo "=========================================="
echo "Executive Meeting Suite - App URL Setup"
echo "=========================================="
echo ""

# Check if running on Heroku
if [ -n "$HEROKU_APP_NAME" ]; then
    echo "🔍 Detected Heroku deployment"
    APP_URL="https://$HEROKU_APP_NAME.herokuapp.com"
    echo "Setting APP_URL to: $APP_URL"
    heroku config:set APP_URL=$APP_URL
    heroku config:set CLIENT_URL=$APP_URL
    heroku config:set CORS_ORIGIN=$APP_URL
    exit 0
fi

# Interactive setup
echo "Enter your app's deployed URL (e.g., https://app.gatronova.com):"
read -p "APP_URL: " APP_URL

if [ -z "$APP_URL" ]; then
    echo "❌ Error: APP_URL cannot be empty"
    exit 1
fi

# Validate URL format
if [[ ! $APP_URL =~ ^https?:// ]]; then
    echo "❌ Error: URL must start with http:// or https://"
    exit 1
fi

echo ""
echo "Configuring app with:"
echo "  APP_URL: $APP_URL"
echo ""

# Update backend/.env
if [ -f "backend/.env" ]; then
    echo "Updating backend/.env..."

    # Use sed to update URLs (cross-platform)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|APP_URL=.*|APP_URL=$APP_URL|g" backend/.env
        sed -i '' "s|CLIENT_URL=.*|CLIENT_URL=$APP_URL|g" backend/.env
        sed -i '' "s|CORS_ORIGIN=.*|CORS_ORIGIN=$APP_URL|g" backend/.env
    else
        # Linux
        sed -i "s|APP_URL=.*|APP_URL=$APP_URL|g" backend/.env
        sed -i "s|CLIENT_URL=.*|CLIENT_URL=$APP_URL|g" backend/.env
        sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=$APP_URL|g" backend/.env
    fi

    echo "✅ Updated backend/.env"
else
    echo "⚠️  Warning: backend/.env not found"
fi

# If Heroku deployment
if command -v heroku &> /dev/null; then
    echo ""
    read -p "Deploy to Heroku now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pushing to Heroku..."
        heroku config:set APP_URL=$APP_URL
        heroku config:set CLIENT_URL=$APP_URL
        heroku config:set CORS_ORIGIN=$APP_URL
        git push heroku main
        echo "✅ Deployment complete!"
        heroku open
    fi
fi

echo ""
echo "✅ Configuration complete!"
echo "APP_URL is now: $APP_URL"
echo ""
echo "💡 Next steps:"
echo "1. Restart the application"
echo "2. Send a test email to verify the link works"
echo "3. Responsible persons should receive emails with the correct URL"
