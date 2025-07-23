import { ChatOpenAI } from "@langchain/openai";
import {
  searchProductTool,
  placeOrderTool,
  getOrderByIdTool,
} from "../tools/productTools.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";

const tools = [searchProductTool, placeOrderTool, getOrderByIdTool];
// const prompt = ChatPromptTemplate.fromMessages([
//   [
//     "system",
//     "You are a helpful ecommerce assistant. Always return structured JSON objects in your final response",
//   ],
//   ["placeholder", "{chat_history}"],
//   ["human", "{input}"],
//   ["placeholder", "{agent_scratchpad}"],
// ]);
function extractJsonFromMarkdown(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  return match ? JSON.parse(match[1]) : JSON.parse(text);
}

const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful ecommerce assistant. Always return structured JSON objects in your final response. Do NOT include markdown formatting or explanations.

Human: {input}

{agent_scratchpad}
`);

export async function runAssistant(userMessage) {
  const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

  const agent = await createToolCallingAgent({ llm, tools, prompt });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    // maxIterations: 2,
  });
  const response = await agentExecutor.invoke({ input: userMessage });
  // console.log("response", response);
  const raw = response.output;
  // console.log("RESPONSE.output", raw);
  const json = extractJsonFromMarkdown(raw);
  return json;
}
