# Shape MCP Demo

A Next.js application that demonstrates Model Context Protocol (MCP) integration with Shape Network blockchain tools, featuring advanced tool chaining capabilities.

## Features

- **Advanced Tool Chaining**: AI automatically chains multiple tools together for complex queries
- **Shape Network Integration**: Direct access to blockchain data and gasback calculations
- **Real-time Web3 Operations**: Connect wallet and perform blockchain operations
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS

## Tool Chaining Examples

The AI can automatically chain tools to answer complex questions:

**Gasback Earnings Calculation:**

```
User: "How much gasback can I earn if my contract gets 1000 tx per day for 3 months?"

AI automatically executes:
1. getChainStatus() → Gets current gas prices and network metrics
2. simulateGasbackEarnings() → Calculates earnings using real gas data
```

**Network Analysis:**

```
User: "What are current gas prices and potential earnings for 500 transactions?"

AI automatically executes:
1. getChainStatus() → Current network status
2. simulateGasbackEarnings() → Earnings simulation with current data
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- MCP Server running on port 3002

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-demo

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Add your API keys and configuration

# Start the development server
yarn dev
```

### Testing Tool Chaining

1. Start the application: `yarn dev`
2. Open http://localhost:3000
3. Try these example queries to test tool chaining:
   - "How much gasback can I earn if my contract gets 1000 tx per day for 3 months?"
   - "What are current gas prices and show me earnings for 250 transactions?"
   - "Get network status and calculate gasback for 50 daily transactions over 1 week"

Watch the console logs to see the step-by-step tool execution process.

## Architecture

### Tool Chaining Configuration

- **maxSteps**: Set to 10 to allow complex multi-step operations
- **Enhanced System Prompt**: Guides AI to properly chain gasback calculation tools
- **Step Debugging**: `onStepFinish` callback logs each step for debugging
- **Visual Feedback**: UI shows step-by-step tool execution with arrows and step numbers

### AI SDK Configuration

```typescript
const result = await streamText({
  model: openai('gpt-4o'),
  tools,
  messages,
  maxSteps: 10, // Allow complex tool chains
  onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
    // Debug logging for tool chain execution
  },
});
```

## Available MCP Tools

The application connects to Shape Network MCP tools including:

- `getChainStatus` - Network status and gas metrics
- `simulateGasbackEarnings` - Calculate potential gasback earnings
- `getShapeCreatorAnalytics` - Creator performance data
- `getTopShapeCreators` - Top creators by earnings
- `getCollectionAnalytics` - NFT collection data
- `getShapeNft` - NFT ownership data
- `getStackAchievements` - User achievement data

## Development

### Project Structure

```
├── app/
│   ├── api/chat/route.ts          # Enhanced chat API with tool chaining
│   └── api/call-mcp-tool/route.ts # Direct MCP tool calls
├── components/
│   ├── chat-interface.tsx         # Improved UI with tool chain visualization
│   └── mcp-status-panel.tsx       # MCP server status and tools
├── hooks/
│   └── use-mcp.ts                 # MCP integration hook
└── types.ts                       # Type definitions
```

### Key Improvements

1. **System Prompt Enhancement**: Detailed guidance for tool chaining patterns
2. **Step Visualization**: Clear UI showing tool execution sequence
3. **Debug Logging**: Console output for tracing tool chain execution
4. **Increased Step Limit**: maxSteps increased from 5 to 10
5. **Example Queries**: Built-in examples for testing tool chaining

## Troubleshooting

### Tool Chaining Not Working

1. **Check MCP Server**: Ensure it's running on port 3002
2. **Verify Tools**: Use the MCP Status Panel to see available tools
3. **Console Logs**: Check browser/server console for step execution logs
4. **Query Format**: Use specific questions that require multiple steps

### Common Issues

- **Server Connection**: Make sure MCP server is running before starting the app
- **Tool Availability**: Some tools may require specific parameters or authentication
- **Rate Limits**: Complex tool chains may hit rate limits on external APIs

## License

MIT
