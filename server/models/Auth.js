import mongoose from 'mongoose';

const AuthSchema = new mongoose.Schema({
  storeId: { type: String, required: true, unique: true, default: "default-store" },
  pinHash: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Auth', AuthSchema);
