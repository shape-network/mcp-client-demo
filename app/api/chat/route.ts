import { openai } from '@ai-sdk/openai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { experimental_createMCPClient, streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Connect to deployed MCP server
  // const url = new URL('https://shape-mcp-server.vercel.app/mcp');
  const url = new URL('http://localhost:3002/mcp');
  const mcpClient = await experimental_createMCPClient({
    transport: new StreamableHTTPClientTransport(url),
  });

  // Get tools
  const tools = await mcpClient.tools();

  const result = await streamText({
    model: openai('gpt-4o'),
    tools,
    messages,
    maxSteps: 5, // Allow up to 5 sequential tool calls
    system: `You are a helpful assistant for Shape Network blockchain data and Web3 operations.

Always respond in plain text only. Do not use markdown formatting.`,
    onFinish: async () => {
      await mcpClient.close();
    },
  });

  return result.toDataStreamResponse();
}
