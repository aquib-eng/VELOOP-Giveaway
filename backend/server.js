require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  await connectDB();

  isConnected = true;

  console.log("MongoDB connected successfully");
};

// Vercel serverless entry point
module.exports = async (req, res) => {
  try {
    await connectDatabase();

    return app(req, res);
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};