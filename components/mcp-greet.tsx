'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMcpGreet, useMcpServerStatus } from '@/hooks/use-mcp';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function McpGreetDemo() {
  const [name, setName] = useState('');

  const { data: serverStatusData, isLoading: isCheckingStatus } = useMcpServerStatus();
  const {
    mutate: greet,
    data: greetResponse,
    isPending: isGreeting,
    reset: resetGreetResponse,
  } = useMcpGreet();

  const serverStatus = isCheckingStatus
    ? 'unknown'
    : serverStatusData?.success
      ? 'connected'
      : 'disconnected';

  const availableTools = serverStatusData?.availableTools || [];
  const isLoading = isGreeting;
  const response = greetResponse;

  const handleGreet = () => {
    if (!name.trim()) return;
    resetGreetResponse();
    greet(name);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>XMCP Greet Tool Demo</CardTitle>
          <CardDescription>Test calling the greet tool from your XMCP server</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center text-sm">
            <div
              className={cn('mr-2 h-2 w-2 animate-pulse rounded-full', {
                'bg-green-500': serverStatus === 'connected',
                'bg-red-500': serverStatus === 'disconnected',
                'bg-gray-400': serverStatus === 'unknown',
              })}
            />
            {serverStatus === 'unknown' && 'Checking server status...'}
            {serverStatus === 'connected' && 'Server Connected'}
            {serverStatus === 'disconnected' && 'Server Disconnected'}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Enter your name:
            </label>
            <div className="flex gap-2">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name here..."
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleGreet()}
              />
              <Button onClick={handleGreet} disabled={isLoading || !name.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Greet
              </Button>
            </div>
          </div>

          {response && (
            <Alert
              className={cn({
                'border-green-200 bg-green-50': response.success,
                'border-red-200 bg-red-50': !response.success,
              })}
            >
              <AlertDescription>
                {response.success ? (
                  <div>
                    <strong>Success!</strong>
                    <div className="mt-1">
                      {response.result?.content?.[0]?.text || 'No response text'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong>Error:</strong> {response.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Tools ({availableTools.length})</CardTitle>
          <CardDescription>Tools discovered from your XMCP server</CardDescription>
        </CardHeader>
        <CardContent>
          {availableTools.length > 0 ? (
            <div className="flex flex-col gap-3">
              {availableTools.map((tool) => (
                <div key={tool.name} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <code className="rounded bg-gray-100 px-2 py-1 font-mono">{tool.name}</code>
                    {tool.annotations?.readOnlyHint && <Badge variant="outline">Read-only</Badge>}
                  </div>
                  <p className="mb-2 text-sm text-gray-600">{tool.description}</p>
                  {tool.inputSchema.required.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Required: {tool.inputSchema.required.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {serverStatus === 'connected' ? 'No tools found' : 'Connect to server to see tools'}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div>
            1. <strong>XMCP Server:</strong> Running on port 3002 with your greet tool
          </div>
          <div>
            2. <strong>Next.js API Route:</strong> <code>/api/call-mcp-tool</code> handles JSON-RPC
            communication
          </div>
          <div>
            3. <strong>Frontend:</strong> This component calls the API route with user input
          </div>
          <div>
            4. <strong>Flow:</strong> User input → Next.js API → XMCP Server → Tool execution →
            Response
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
