import mongoose from 'mongoose';

const StoreDataSchema = new mongoose.Schema({
  storeId: { type: String, required: true, unique: true, default: "default-store" },
  inventory: { type: Array, default: [] },
  sales: { type: Array, default: [] },
  waste: { type: Array, default: [] },
  supplyRequests: { type: Array, default: [] },
  settings: {
    blockStockout: { type: Boolean, default: false },
    dateOverride: { type: String, default: null },
  },
  lastSyncedAt: { type: Date, default: Date.now },
});

export default mongoose.model('StoreData', StoreDataSchema);
