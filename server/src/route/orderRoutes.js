import express from "express";
import { getOrderById } from "../controller/orderController.js";

import placeOrder from "../controller/orderController.js";

const router = express.Router();

router.post("/", placeOrder);
router.get("/:id", getOrderById);


export default router;
