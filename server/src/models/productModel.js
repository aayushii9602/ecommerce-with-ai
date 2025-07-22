import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
    required: true,
    default: () => "PRD-" + uuidv4(),
    index: true,
  },
  productName: { type: String, required: true },
  supplierName: { type: String, required: true },
  quantityAvailable: { type: Number, default: 0 },
  price: { type: Number, required: true },
  oversell: { type: Boolean, default: false },
});

export const findProductsByQuery = async (query = "") => {
  // console.log("in find product by query function");
  return await productModel
    .find({
      productName: { $regex: query, $options: "i" },
    })
    .limit(10);
};

export const productModel = mongoose.model("Product", ProductSchema);
