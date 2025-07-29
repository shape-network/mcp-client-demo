import { openai } from '@ai-sdk/openai';
import { experimental_createMCPClient, streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Connect to your Shape MCP server (exactly as documented)
    const mcpClient = await experimental_createMCPClient({
      name: 'shape-mcp',
      transport: {
        type: 'http',
        url: 'http://localhost:3002/mcp', // Use http://localhost:3002/mcp for local dev
      },
    });

    // Get all available tools exposed
    const tools = await mcpClient.tools();

    // Stream response
    const result = await streamText({
      model: openai('gpt-4o'),
      tools,
      messages,
      maxSteps: 10, // Allow multi-step tool usage
      system: `You are a helpful AI assistant with access to MCP (Model Context Protocol) tools.

Available tools allow you to interact with blockchain data, Web3 operations, and Shape Network functionality.

When using tools:
1. Always explain what you're doing before calling a tool
2. Interpret and explain the results in a user-friendly way
3. If a tool fails, explain the error and suggest alternatives
4. Be proactive in offering relevant tools based on user queries

You can help with:
- Blockchain queries and analysis
- Web3 operations and data
- Shape Network specific functionality
- General assistance and explanations

Feel free to explore and use the available tools to provide comprehensive assistance.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}