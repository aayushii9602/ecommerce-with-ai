import { DynamicTool } from "@langchain/core/tools";
import { findProductsByQuery } from "../models/productModel.js";
import { z } from "zod";

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
