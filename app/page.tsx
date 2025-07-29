import { ChatInterface } from '@/components/chat-interface';
import { McpStatusPanel } from '@/components/mcp-status-panel';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col justify-start gap-6">
      <ChatInterface />
      <McpStatusPanel />
    </div>
  );
}
