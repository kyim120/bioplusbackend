require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { validateEnv } = require('./config/validateEnv');

// Validate environment variables before anything else
validateEnv();

const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const adminRoutes = require('./routes/admin.routes');
const studentRoutes = require('./routes/student.routes');
const ownerRoutes = require('./routes/owner.routes');
const publicRoutes = require('./routes/public.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const subjectRoutes = require('./routes/subject.routes');
const bookRoutes = require('./routes/book.routes');

const app = express();

// Connect to MongoDB
connectDB();

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:8081',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for API routes
app.use('/api/', apiLimiter);

// Serve static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/books', bookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Global error handling to prevent crash loops and log properly
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // consider exiting or alerting here if needed without crash loop
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // consider exiting or alerting here if needed without crash loop
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
