import { runAssistant } from "../agent/assistantAgents.js";
import { v4 as uuidv4 } from "uuid";
function isEmpty(val) {
  return val === undefined || val == null || val.length <= 0 ? true : false;
}

export async function handleChat(req, res) {
  const { message } = req.body;
  let { chatId } = req.params;
  try {
    if (isEmpty(chatId)) {
      chatId = uuidv4();
      console.log("chatId", chatId);
    }
    const response = await runAssistant(message, chatId);
    res.json({ chatId, response });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
