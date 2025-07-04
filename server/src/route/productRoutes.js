import express from "express";
import searchProducts from "../controller/productController.js";
import { addProduct } from "../controller/productController.js";

const router = express.Router();

router.get("/search", searchProducts);
router.post("/", addProduct);

export default router;
