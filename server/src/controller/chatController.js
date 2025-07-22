import { runAssistant } from "../agent/assistantAgents.js";

export async function handleChat(req, res) {
  const { message } = req.body;
  try {
    const response = await runAssistant(message);
    res.json({ reply: response });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
