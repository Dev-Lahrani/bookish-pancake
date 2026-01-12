/**
 * Express Server Configuration
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import analyzeRoutes from './routes/analyze';
import humanizeRoutes from './routes/humanize';
import advancedAnalyzeRoutes from './routes/advancedAnalyze';
import advancedHumanizeRoutes from './routes/advancedHumanize';
import pdfAnalyzeRoutes from './routes/pdfAnalyze';

// Load environment variables from root .env file
// Try multiple paths to support both ts-node dev and compiled dist
const envPaths = [
  path.resolve(__dirname, '../../.env'),  // From src folder
  path.resolve(__dirname, '../.env'),     // From dist folder
  path.resolve(process.cwd(), '.env'),    // From current working directory
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✓ Loaded .env from: ${envPath}`);
    break;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apis: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY
    }
  });
});

// API Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/humanize', humanizeRoutes);
app.use('/api/analyze-advanced', advancedAnalyzeRoutes);
app.use('/api/humanize-advanced', advancedHumanizeRoutes);

// PDF and batch analysis routes with file upload middleware
app.use('/api/analyze-pdf', upload.single('file'), pdfAnalyzeRoutes);
app.use('/api/batch-analyze', pdfAnalyzeRoutes);
app.use('/api/history', pdfAnalyzeRoutes);
app.use('/api/statistics', pdfAnalyzeRoutes);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`🔑 Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  POST http://localhost:${PORT}/api/analyze`);
  console.log(`  POST http://localhost:${PORT}/api/humanize`);
  console.log(`  GET  http://localhost:${PORT}/health\n`);
});

export default app;
