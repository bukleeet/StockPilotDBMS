import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Auth from '../models/Auth.js';

const router = Router();

// POST /api/auth/verify-pin
router.post('/verify-pin', async (req, res) => {
  try {
    const { storeId = 'default-store', pin } = req.body;

    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    const auth = await Auth.findOne({ storeId });
    if (!auth) {
      return res.status(404).json({ error: 'Store not found. Please contact your administrator.' });
    }

    const isMatch = await bcrypt.compare(String(pin), auth.pinHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const secret = process.env.SESSION_SECRET || 'stockpile-secret-key';
    const token = jwt.sign(
      { storeId, role: 'manager' },
      secret,
      { expiresIn: '12h' }
    );

    res.json({ token, role: 'manager', storeId });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// POST /api/auth/change-pin (protected)
router.post('/change-pin', async (req, res) => {
  try {
    // Verify JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      const secret = process.env.SESSION_SECRET || 'stockpile-secret-key';
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (decoded.role !== 'manager') {
      return res.status(403).json({ error: 'Manager access required' });
    }

    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin) {
      return res.status(400).json({ error: 'Both old and new PIN are required' });
    }

    if (String(newPin).length < 4) {
      return res.status(400).json({ error: 'New PIN must be at least 4 characters' });
    }

    const auth = await Auth.findOne({ storeId: decoded.storeId });
    if (!auth) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const isOldMatch = await bcrypt.compare(String(oldPin), auth.pinHash);
    if (!isOldMatch) {
      return res.status(401).json({ error: 'Current PIN is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    auth.pinHash = await bcrypt.hash(String(newPin), salt);
    auth.updatedAt = new Date();
    await auth.save();

    res.json({ message: 'PIN updated successfully' });
  } catch (error) {
    console.error('Change PIN error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
