// Enhanced CORS configuration for Replit
const corsOptions = {
  origin: (origin, callback) => {
    // Allow Replit origins
    const replitPattern = /\.replit\.dev$/;
    const replitCodePattern = /\.replit\.codes$/;

    // Allow localhost and development origins
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      'http://0.0.0.0:5000',
      'http://0.0.0.0:3000',
      'https://localhost:5000',
      'https://localhost:3000',
    ];

    // Allow if no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow Replit domains
    if (replitPattern.test(origin) || replitCodePattern.test(origin)) {
      return callback(null, true);
    }

    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all in development (Replit is always development)
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Reject other origins in production
    logger.warn('⚠️ CORS: Blocked origin', { origin });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Enhanced security with Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://*.replit.dev",
        "wss://*.replit.dev",
        "https://*.replit.codes",
        "wss://*.replit.codes",
        "http://localhost:*",
        "https://localhost:*",
        "ws://localhost:*",
        "wss://localhost:*",
        "http://0.0.0.0:*",
        "https://0.0.0.0:*",
        "ws://0.0.0.0:*",
        "wss://0.0.0.0:*",
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  })
);