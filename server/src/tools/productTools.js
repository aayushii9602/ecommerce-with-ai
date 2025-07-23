import { DynamicTool } from "@langchain/core/tools";
import { findProductsByQuery } from "../models/productModel.js";
import { z } from "zod";

const placeOrderSchema = z.object({
  item_id: z.string(),
  quantity: z.number().int().positive(),
  user_id: z.string(),
  seller_name: z.string(),
});

export const searchProductTool = new DynamicTool({
  name: "searchProducts",
  description:
    "Search the product catalog using any keyword or phrase, such as a product name, category, or feature (e.g., 'laptop', 'wireless mouse', or 'gaming chair').",
  schema: z.object({
    input: z.string().describe("Search query"),
  }),
  func: async (input) => {
    console.log("in search tool", input);
    // return "hi";
    const products = await findProductsByQuery(input);
    console.log("products", products);
    return JSON.stringify(products);
  },
});

export const placeOrderTool = new DynamicTool({
  name: "placeOrders",
  description:
    "place the order for the product, provided the item_id, quantity, user_id, seller_name",
  schema: placeOrderSchema,
  func: async (args) => {
    const parsed = typeof args === "string" ? JSON.parse(args) : args;
    const { item_id, quantity, user_id, seller_name } = parsed;

    try {
      const response = await fetch(
        `http://${process.env.HOST}:${process.env.PORT}/api/v1/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            item_id,
            quantity,
            user_id,
            seller_name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order placement failed");
      }

      return `Order placed successfully. Order ID: ${data._id}, Expected Delivery: ${data.expected_delivery}`;
    } catch (error) {
      console.error("Error placing order:", error.message);
      return `Failed to place order: ${error.message}`;
    }
  },
});

export const getOrderByIdTool = new DynamicTool({
  name: "getOrderById",
  description: "Fetch the details of an order using its order ID",
  schema: z.object({
    order_id: z.string().describe("The ID of the order to retrieve"),
  }),
  func: async (order_id) => {
    try {
      const response = await fetch(
        `http://${process.env.HOST}:${process.env.PORT}/api/v1/order/${order_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }
      return `
      ✅ Order Details:
      • Order ID: ${data.orderId}
      • Product ID: ${data.item_id._id || data.item_id}
      • Quantity: ${data.quantity}
      • Seller: ${data.seller_name}
      • Status: ${data.status}
      • Expected Delivery: ${data.expectedDelivery}
      • Actual Delivery: ${data.actualDelivery}
      `.trim();
    } catch (err) {
      return `❌ Error fetching order: ${err.message}`;
    }
  },
});
