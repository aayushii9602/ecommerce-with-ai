import { productModel } from "../models/productModel.js";
import { findProductsByQuery } from "../models/productModel.js";
export default async function searchProducts(req, res) {
  try {
    const q = req.query.q || "";
    const products = await findProductsByQuery(q);
    console.log("QUERY:", q);
    console.log("RES", products);
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Product search failed", error: err.message });
  }
}

export async function addProduct(req, res) {
  try {
    const { productName, supplierName, quantityAvailable, price, oversell } =
      req.body;

    // Validation
    if (
      !productName ||
      !supplierName ||
      price == null ||
      !quantityAvailable ||
      quantityAvailable == null
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = new productModel({
      productName,
      supplierName,
      quantityAvailable: quantityAvailable || 0,
      price,
      oversell: oversell || false,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add product", error: err.message });
  }
}
