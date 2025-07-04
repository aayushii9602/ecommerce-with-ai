import express from "express";
import dotenv from "dotenv";
import orderRoutes from "./src/route/orderRoutes.js"
import productRoutes from "./src/route/productRoutes.js"
import connectDB from "./src/db/dbConfig.js";
import cors from "cors";

// Load environment variables from a .env file
dotenv.config();

// Create an instance of the Express application
const app = express();

// regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

// router middleware
app.use("/api/v1/order", orderRoutes);

app.use("/api/v1/product", productRoutes);

export default app;
