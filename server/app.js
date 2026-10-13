import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { connectDB } from './config/db.js';
import Auth from './models/Auth.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection & default seed cache for serverless and standalone
let isSeeded = false;
async function seedDefaultAuth() {
  if (isSeeded) return;
  try {
    const existing = await Auth.findOne({ storeId: 'default-store' });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash('1234', salt);
      await Auth.create({ storeId: 'default-store', pinHash });
      console.log('Default store PIN seeded (PIN: 1234)');
    }
    isSeeded = true;
  } catch (error) {
    console.error('Failed to seed default auth:', error);
  }
}

// Ensure database is connected on incoming requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await seedDefaultAuth();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({
      error: 'Database connection failed. Please ensure MONGO_URI is set in your environment variables.',
    });
  }
});

// Routes (support both /api/... and /... for serverless rewrites)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/sync', syncRoutes);

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
