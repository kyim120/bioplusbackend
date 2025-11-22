# Environment Variables Setup

## Required Variables for Authentication System

Add these variables to your `/backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bioplus

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production-min-32-chars
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Required for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Frontend URL (for email verification links)
FRONTEND_URL=http://localhost:5173

# OpenAI API (Optional - only if using AI features)
OPENAI_API_KEY=your-openai-api-key-here
```

## How to Set Up Email (Gmail Example)

1. **Enable 2-Factor Authentication** on your Google account
2. **Create App Password**:
   - Go to: https://myaccount.google.com/security
   - Click on "2-Step Verification"
   - Scroll to "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password
3. **Update .env**:
   - Set `SMTP_USER` to your Gmail address
   - Set `SMTP_PASS` to the app password (no spaces)

## Quick Update Command

Run this to update your .env file:

```bash
cd /home/kyim/bioplus/backend

# Backup existing .env
cp .env .env.backup

# Add missing variables (edit the values!)
cat >> .env << 'EOF'

# JWT Refresh Token Secret
JWT_REFRESH_SECRET=your-refresh-secret-change-this-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
EOF
```

## Test Configuration

After updating .env, test the server:

```bash
cd /home/kyim/bioplus/backend
npm run dev
```

The server should start without errors.

## Note

- The server will start even without email configuration
- Email features will fail silently if SMTP is not configured
- You can test other features while setting up email later



