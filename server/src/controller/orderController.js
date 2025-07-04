import { productModel } from "../models/productModel.js";
import { orderModel } from "../models/orderModel.js";

export default async function placeOrder(req, res) {
  try {
    const { item_id, quantity, user_id, seller_name } = req.body;

    if (!item_id || !quantity || !user_id || !seller_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await productModel.findById(item_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.oversell && quantity > product.quantityAvailable) {
      return res
        .status(400)
        .json({ message: "Insufficient stock and oversell not allowed" });
    }

    console.log("Before update:", product.quantityAvailable);
    product.quantityAvailable -= quantity;
    console.log("After update:", product.quantityAvailable);
    await product.save();

    const updatedProduct = await productModel.findById(item_id);
    console.log(
      "Persisted quantityAvailable:",
      updatedProduct.quantityAvailable
    ); 

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 2);

    const order = new orderModel({
      item_id,
      quantity,
      user_id,
      seller_name,
      expected_delivery: expectedDelivery,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Order creation failed", error: err.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await orderModel.findById(req.params.id).populate("item_id");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
}
