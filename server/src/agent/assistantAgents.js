import { ChatOpenAI } from "@langchain/openai";
import { searchProductTool } from "../tools/productTools.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";

const tools = [searchProductTool];
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful ecommerce assistant"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

export async function runAssistant(userMessage) {
  //   const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
  
  const agent = await createToolCallingAgent({ llm, tools, prompt });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });
  const response = await agentExecutor.invoke({ input: userMessage });
  return response.output;
}
