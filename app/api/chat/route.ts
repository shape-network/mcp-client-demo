import { config } from '@/lib/config';
import { openai } from '@ai-sdk/openai';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { experimental_createMCPClient, stepCountIs, streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const url = new URL(config.mcpServerUrl);
  const mcpClient = await experimental_createMCPClient({
    transport: new StreamableHTTPClientTransport(url),
  });

  const tools = await mcpClient.tools();

  const result = await streamText({
    model: openai('gpt-4o'),
    tools,
    messages,
    stopWhen: stepCountIs(5),
    system: `You are a helpful assistant for Shape Network blockchain data and Web3 operations.

You have access to multiple tools that can be chained together to provide comprehensive answers:
- Use multiple tools in sequence when needed to gather all required information
- For example, get gas prices first, then calculate gasback earnings based on those prices
- Format your responses using markdown for better readability (bold, lists, code blocks, etc.)
IMPORTANT: Always try to use the available tools first.`,
    onFinish: async () => {
      await mcpClient.close();
    },
  });

  return result.toUIMessageStreamResponse();
}
