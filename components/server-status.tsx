'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ServerStatus() {
  const [serverStatus, setServerStatus] = useState<'unknown' | 'connected' | 'disconnected'>(
    'unknown'
  );

  const checkServerStatus = async () => {
    try {
      const res = await fetch('/api/call-mcp-tool');
      const data = await res.json();
      setServerStatus(data.success ? 'connected' : 'disconnected');
    } catch {
      setServerStatus('disconnected');
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 60 * 5 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getStatusInfo = () => {
    switch (serverStatus) {
      case 'connected':
        return {
          text: 'MCP Server Connected',
          color: 'bg-green-500',
          variant: 'default' as const,
        };
      case 'disconnected':
        return {
          text: 'MCP Server Disconnected',
          color: 'bg-red-500',
          variant: 'destructive' as const,
        };
      default:
        return {
          text: 'Checking Server...',
          color: 'bg-gray-400',
          variant: 'secondary' as const,
        };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-2 w-2 animate-pulse rounded-full', status.color)} />
      <p className="text-muted-foreground text-xs">{status.text}</p>
      {serverStatus === 'disconnected' && (
        <span className="text-xs text-gray-500">(Check port 3002)</span>
      )}
    </div>
  );
}
