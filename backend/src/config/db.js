const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI environment variable is not defined"
      );
    }

    if (mongoose.connection.readyState === 1) {
      return;
    }

    const connection = await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    throw error;
  }
};

module.exports = connectDB;