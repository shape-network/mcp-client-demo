'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMcpServerStatus } from '@/hooks/use-mcp';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';

export function McpStatusPanel() {
  const { data: serverStatusData, isLoading, refetch, dataUpdatedAt } = useMcpServerStatus();

  const serverStatus = isLoading
    ? 'unknown'
    : serverStatusData?.success
      ? 'connected'
      : 'disconnected';

  const availableTools = serverStatusData?.availableTools || [];
  const lastChecked = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const getStatusConfig = () => {
    switch (serverStatus) {
      case 'connected':
        return {
          icon: CheckCircle2,
          text: 'MCP Server Connected',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          dotColor: 'bg-green-500',
        };
      case 'disconnected':
        return {
          icon: XCircle,
          text: 'MCP Server Disconnected',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200',
          dotColor: 'bg-red-500',
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Checking MCP Server...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          dotColor: 'bg-gray-400',
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <Card className={cn('border-2', status.bgColor)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3 w-3 rounded-full',
                  status.dotColor,
                  isLoading && 'animate-pulse'
                )}
              />
              <StatusIcon className={cn('h-5 w-5', status.color)} />
              <CardTitle className="text-lg">{status.text}</CardTitle>
            </div>
            {serverStatus === 'connected' && (
              <Badge variant="outline" className="border-green-300 text-green-700">
                shape-mcp-server.vercel.app
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
        <CardDescription className="flex items-center gap-2">
          {serverStatus === 'connected' && (
            <>
              <span>
                {availableTools.length} tool{availableTools.length !== 1 ? 's' : ''} available
              </span>
              {lastChecked && (
                <span className="text-xs text-gray-500">
                  • Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </>
          )}
          {serverStatus === 'disconnected' && (
            <span>Ensure the MCP server is accessible at https://shape-mcp-server.vercel.app/mcp</span>
          )}
          {serverStatus === 'unknown' && <span>Establishing connection...</span>}
        </CardDescription>
      </CardHeader>

      {serverStatus === 'disconnected' && (
        <CardContent>
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              The MCP server appears to be offline. Make sure it&apos;s accessible at{' '}
              <code className="rounded bg-yellow-100 px-1 py-0.5 text-xs">https://shape-mcp-server.vercel.app/mcp</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      )}

      {serverStatus === 'connected' && availableTools.length > 0 && (
        <CardContent>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Available Tools</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {availableTools.map((tool) => (
                <div key={tool.name} className="rounded-lg border bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <code className="rounded bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700">
                      {tool.name}
                    </code>
                    {tool.annotations?.readOnlyHint && (
                      <Badge variant="outline" className="text-xs">
                        Read-only
                      </Badge>
                    )}
                    {tool.annotations?.destructiveHint && (
                      <Badge variant="destructive" className="text-xs">
                        Destructive
                      </Badge>
                    )}
                  </div>
                  <p className="mb-2 text-sm text-gray-600">{tool.description}</p>
                  {tool.inputSchema?.required && tool.inputSchema.required.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      <span className="font-medium text-gray-700">
                        Required {tool.inputSchema.required.length > 1 ? 'params' : 'param'}:
                      </span>
                      {tool.inputSchema.required.map((param, index) => {
                        const paramSchema = tool.inputSchema?.properties?.[param] as
                          | { type?: string; description?: string }
                          | undefined;
                        const paramType = paramSchema?.type;
                        const shouldShowType = paramType && paramType !== 'string';

                        return (
                          <span key={param} className="flex items-center">
                            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">
                              {param}
                              {shouldShowType && (
                                <span className="text-blue-600">: {paramType}</span>
                              )}
                            </code>
                            {index < tool.inputSchema.required.length - 1 && (
                              <span className="mx-1 text-gray-400">,</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}

      {serverStatus === 'connected' && availableTools.length === 0 && (
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connected to MCP server but no tools were found. This might indicate a configuration
              issue.
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
    </Card>
  );
}
