import mongoose from 'mongoose';

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stockpilot';

  try {
    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (!process.env.MONGO_URI) {
      console.error('\n[Notice] MONGO_URI was not set in your environment variables.');
    }
    throw error;
  }
};
