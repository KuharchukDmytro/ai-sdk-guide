import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool, type ModelMessage } from "ai";
import axios from "axios";
import z from "zod";

const webSearchTool = tool({
  name: "web_search_preview",
  description: "A tool for searching the web.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "The search query for the knowledgebase. Must be generic, without slang or specific terms. For example, 'What is confidence score?', 'What is the TOS?', etc"
      ),
  }),
  execute: async ({ query }) => {
    try {
      const data = JSON.stringify({
        q: query,
      });

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://google.serper.dev/search",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios.request(config);

      return response.data;
    } catch {
      return {
        type: "error",
        message: "Web search is currently unavailable. Please try again later.",
      };
    }
  },
});

export async function POST(req: Request) {
  const { messages }: { messages: ModelMessage[] } = await req.json();

  const { text } = await generateText({
    model: openai.responses("gpt-4o"),
    system: `
      You are a helpful assistant.
      You have access to a web search tool, use it to search the most relevant information.
      Return the information in a concise manner.
      Do not mention any specific sources.
    `,
    messages,
    tools: { webSearchTool },
    stopWhen: stepCountIs(5),
  });

  return Response.json({
    messages: [{ role: "assistant", content: text }],
  });
}
