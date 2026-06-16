const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const logger = require('./utils/logger');

const app = express();

// Trust Render's proxy headers so express-rate-limit can safely parse X-Forwarded-For
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    if (res.statusCode >= 400) {
      logger.error(`[API Error] ${logMessage}`);
    } else if (duration > 1000) {
      logger.warn(`[Slow API] ${logMessage}`); // Alert on slow queries > 1s
    } else {
      logger.info(`[API Trace] ${logMessage}`);
    }
  });
  next();
});

// Strict CORS policy
const allowedOrigins = [
  "https://educational-content-sharing-platform.vercel.app",
  "https://educational-content-sharing-platfor.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://educonnectsl.org"
];

// Add process.env.FRONTEND_URL if it exists and isn't in the list
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Root route (fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Welcome to the Educational Content Sharing Platform API',
    version: '1.0.0',
    status: 'active'
  });
});

// Docs route
app.get('/docs', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>API Documentation</title>
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
          h1 { border-bottom: 2px solid #2563EB; padding-bottom: 0.5rem; }
          h2 { color: #2563EB; margin-top: 2rem; }
          code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; }
          .endpoint { background: #fff; border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; }
          .method { font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 4px; margin-right: 0.5rem; color: #fff; }
          .get { background: #10B981; } .post { background: #3B82F6; } .put { background: #F59E0B; } .delete { background: #EF4444; }
        </style>
      </head>
      <body>
        <h1>Educational Platform API Documentation</h1>
        
        <h2>Authentication</h2>
        <div class="endpoint"><span class="method post">POST</span> <code>/api/auth/register</code> - Register new user</div>
        <div class="endpoint"><span class="method post">POST</span> <code>/api/auth/login</code> - Login user</div>
        <div class="endpoint"><span class="method get">GET</span> <code>/api/auth/me</code> - Get current user</div>
        
        <h2>Resources</h2>
        <div class="endpoint"><span class="method post">POST</span> <code>/api/resources/upload</code> - Upload resource</div>
        <div class="endpoint"><span class="method get">GET</span> <code>/api/resources</code> - Get all approved resources</div>
        <div class="endpoint"><span class="method get">GET</span> <code>/api/resources/:id</code> - Get single resource</div>
        <div class="endpoint"><span class="method get">GET</span> <code>/api/resources/:id/download</code> - Download resource</div>
        
        <h2>Admin</h2>
        <div class="endpoint"><span class="method get">GET</span> <code>/api/admin/stats</code> - Get dashboard statistics</div>
        <div class="endpoint"><span class="method get">GET</span> <code>/api/admin/resources/pending</code> - Get pending resources</div>
        <div class="endpoint"><span class="method put">PUT</span> <code>/api/admin/resources/:id/approve</code> - Approve resource</div>
        <div class="endpoint"><span class="method put">PUT</span> <code>/api/admin/resources/:id/reject</code> - Reject resource</div>
        <div class="endpoint"><span class="method delete">DELETE</span> <code>/api/admin/users/:id</code> - Delete user</div>
      </body>
    </html>
  `);
});

// Rate limiting - tuned for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 100, // Higher limit for production
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for health checks and root endpoint
    return req.path === '/api/health' || req.path === '/';
  },
  keyGenerator: (req) => {
    try {
      // Properly handle X-Forwarded-For header from proxies like Render
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        // Take the first IP if multiple are present (comma-separated)
        const ip = typeof forwarded === 'string' 
          ? forwarded.split(',')[0].trim() 
          : (Array.isArray(forwarded) ? forwarded[0] : String(forwarded).split(',')[0].trim());
        return ip || req.ip || 'unknown';
      }
      return req.ip || 'unknown';
    } catch (err) {
      // Fallback to request IP if any error occurs
      return req.ip || 'unknown';
    }
  },
  handler: (req, res) => {
    // Custom handler for rate limit exceeded
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edu-content-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('MongoDB connected'))
.catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/search', require('./routes/search'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
