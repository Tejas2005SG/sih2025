import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.route.js';
// import  HospitalRoutes from './routes/hospital.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// If behind a proxy (Heroku/Render/Nginx), this helps secure cookies work
app.set('trust proxy', 1);

// Connect to Database
connectDB();

// CORS Configuration - MOVED TO TOP and SIMPLIFIED
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5174', // Alternative Vite port
  // add deployed frontend(s) if any
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      console.log(`✅ Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // Cache preflight for 24 hours
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Disable CSP for API
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 1000, // More lenient in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks in development
    return !isProd && req.path === '/api/health';
  },
});

app.use(limiter);

// Parse cookies (needed for cookie-based auth)
app.use(cookieParser());

// Body Parser Middleware
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Enhanced request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`\n🔄 ${req.method} ${req.path}`);
    console.log(`📍 Origin: ${req.headers.origin || 'none'}`);
    console.log(`🔑 Auth: ${req.headers.authorization ? 'Bearer token present' : 'no auth header'}`);
    console.log(`🍪 Cookies: ${Object.keys(req.cookies).length > 0 ? Object.keys(req.cookies).join(', ') : 'none'}`);
    next();
  });
}

// Additional CORS headers for complex requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AyurSutra Wellness API Server',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Health Check Route (before auth routes for quick access)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      allowedOrigins,
      requestOrigin: req.headers.origin || 'none',
    },
  });
});



// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/hospital', HospitalRoutes); // Placeholder for hospital routes


// Add a test endpoint for CORS debugging
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test-cors', (req, res) => {
    res.json({
      success: true,
      message: 'CORS test successful',
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  });
  
  app.post('/api/test-cors', (req, res) => {
    res.json({
      success: true,
      message: 'CORS POST test successful',
      body: req.body,
      origin: req.headers.origin,
      timestamp: new Date().toISOString(),
    });
  });
}

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:');
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  console.error('Request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
  });
  
  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: 'Origin not allowed',
      allowedOrigins: process.env.NODE_ENV === 'development' ? allowedOrigins : undefined,
    });
  }
  
  // JWT/Auth errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message),
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: {
        name: err.name,
        code: err.code,
      }
    }),
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
  console.log(`🌐 Allowed Origins:`, allowedOrigins);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`🧪 CORS Test: http://localhost:${PORT}/api/test-cors`);
  }
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
});