import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { McpStatusPanel } from '@/components/mcp-status-panel';
import { ShapeNftViewer } from '@/components/shape-nft-viewer';

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col justify-start gap-6">
      <McpStatusPanel />
      <AnalyticsDashboard />
      <ShapeNftViewer />
    </div>
  );
}
