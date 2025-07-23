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
    // console.log("in search tool", input);
    const products = await findProductsByQuery(input);
    return products;
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

      // return `Order placed successfully. Order ID: ${data._id}, Expected Delivery: ${data.expected_delivery}`;
      return {
        status: "success",
        order_id: data._id,
        expected_delivery: data.expected_delivery,
      };
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
      // console.log("DATA", data);
      return {
        order_id: data.orderId,
        product_id: data.item_id._id || data.item_id,
        quantity: data.quantity,
        seller: data.seller_name,
        status: data.status,
        expected_delivery: data.expectedDelivery,
        actual_delivery: data.actualDelivery,
      };
    } catch (err) {
      return `❌ Error fetching order: ${err.message}`;
    }
  },
});
