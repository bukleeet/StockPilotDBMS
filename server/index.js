import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { connectDB } from './config/db.js';
import Auth from './models/Auth.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auto-seed default PIN on first startup
async function seedDefaultAuth() {
  try {
    const existing = await Auth.findOne({ storeId: 'default-store' });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const pinHash = await bcrypt.hash('1234', salt);
      await Auth.create({ storeId: 'default-store', pinHash });
      console.log('Default store PIN seeded (PIN: 1234)');
    }
  } catch (error) {
    console.error('Failed to seed default auth:', error);
  }
}

// Start server
async function start() {
  await connectDB();
  await seedDefaultAuth();
  app.listen(PORT, () => {
    console.log(`StockPilot API running on port ${PORT}`);
  });
}

start();
