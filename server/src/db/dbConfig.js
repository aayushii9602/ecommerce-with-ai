import mongoose from "mongoose";
import { config } from "dotenv";
config();
// MongoDB connection URL
const mongoURI = process.env.MONGO_URI;

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Export the connection function
export default connectDB;
