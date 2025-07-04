import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const OrderSchema = new mongoose.Schema({
    orderId: {
    type: String,
    unique: true,
    required: true,
    default: () => "ORD-" + uuidv4(),
    index: true,
  },
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  user_id: { type: String, required: true },
  seller_name: { type: String, required: true },
  status: { type: String, default: "pending" },
  expected_delivery: { type: Date, required: true },
  actual_delivery: { type: Date, default: null },
});

export const orderModel = mongoose.model("Order", OrderSchema);
