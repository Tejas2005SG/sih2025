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



// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/hospital', HospitalRoutes); // Placeholder for hospital routes





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