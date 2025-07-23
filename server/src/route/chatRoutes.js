import express from "express";
import { handleChat } from "../controller/chatController.js";
const router = express.Router();

router.post("/", handleChat);
router.post("/:chatId", handleChat);

export default router;
