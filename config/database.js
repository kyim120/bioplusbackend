const mongoose = require('mongoose');

const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (retryCount < maxRetries) {
      console.log(`Retrying to connect to MongoDB in ${retryDelay / 1000} seconds... (${retryCount + 1}/${maxRetries})`);
      await new Promise(res => setTimeout(res, retryDelay));
      return connectDB(retryCount + 1);
    } else {
      console.error('Max retries reached. Could not connect to MongoDB.');
      // Instead of exiting immediately, throw error to allow upper layers to handle crash or recovery
      throw error;
    }
  }
};

module.exports = connectDB;
