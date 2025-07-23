import express from "express";
import { handleChat, getChats } from "../controller/chatController.js";
const router = express.Router();

router.post("/", handleChat);
router.post("/:chatId", handleChat);
router.get("/:chatId", getChats);

export default router;
