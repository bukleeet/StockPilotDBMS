import { Router } from 'express';
import jwt from 'jsonwebtoken';
import StoreData from '../models/StoreData.js';

const router = Router();

// JWT middleware for protected routes
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const secret = process.env.SESSION_SECRET || 'stockpile-secret-key';
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// GET /api/sync/pull?storeId=default-store
router.get('/pull', async (req, res) => {
  try {
    const storeId = req.query.storeId || 'default-store';
    const storeData = await StoreData.findOne({ storeId });

    if (!storeData) {
      // No cloud data yet — return empty state
      return res.json({
        storeId,
        inventory: [],
        sales: [],
        waste: [],
        supplyRequests: [],
        settings: { blockStockout: false, dateOverride: null },
        lastSyncedAt: null,
      });
    }

    res.json({
      storeId: storeData.storeId,
      inventory: storeData.inventory,
      sales: storeData.sales,
      waste: storeData.waste,
      supplyRequests: storeData.supplyRequests,
      settings: storeData.settings,
      lastSyncedAt: storeData.lastSyncedAt,
    });
  } catch (error) {
    console.error('Sync pull error:', error);
    res.status(500).json({ error: 'Failed to pull data from cloud' });
  }
});

// POST /api/sync/push (protected — manager only)
router.post('/push', requireAuth, async (req, res) => {
  try {
    const { storeId = 'default-store', inventory, sales, waste, supplyRequests, settings } = req.body;

    const updateData = {
      lastSyncedAt: new Date(),
    };
    if (inventory !== undefined) updateData.inventory = inventory;
    if (sales !== undefined) updateData.sales = sales;
    if (waste !== undefined) updateData.waste = waste;
    if (supplyRequests !== undefined) updateData.supplyRequests = supplyRequests;
    if (settings !== undefined) updateData.settings = settings;

    const storeData = await StoreData.findOneAndUpdate(
      { storeId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Data synced to cloud',
      lastSyncedAt: storeData.lastSyncedAt,
    });
  } catch (error) {
    console.error('Sync push error:', error);
    res.status(500).json({ error: 'Failed to push data to cloud' });
  }
});

export default router;
