import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stockpilot';
  
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (!process.env.MONGO_URI) {
      console.error('\n[Notice] MONGO_URI was not set in your .env file.');
      console.error('The server attempted to connect to local MongoDB at mongodb://127.0.0.1:27017/stockpilot.');
    }
    console.error('Please ensure MongoDB is running locally or set MONGO_URI in your .env file with a valid MongoDB Atlas connection string.\n');
    process.exit(1);
  }
};
