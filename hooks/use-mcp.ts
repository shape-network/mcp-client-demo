'use client';

import { McpResponse, McpStatusResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

async function callMcpTool(
  toolName: string,
  parameters?: Record<string, unknown>
): Promise<McpResponse> {
  const res = await fetch('/api/call-mcp-tool', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      toolName,
      parameters: parameters || {},
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
}

async function checkMcpServerStatus(): Promise<McpStatusResponse> {
  const res = await fetch('/api/call-mcp-tool');
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export function useMcpServerStatus() {
  return useQuery({
    queryKey: ['mcp-status'],
    queryFn: checkMcpServerStatus,
    refetchInterval: 60 * 5 * 1000,
    staleTime: 30 * 1000,
  });
}

export function usePrepareMintSVGNFT(
  recipientAddress: string,
  svgContent: string,
  name: string,
  description: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['prepare-mint-svg-nft', recipientAddress, svgContent, name, description],
    queryFn: async () => {
      const response = await callMcpTool('prepareMintSVGNFT', {
        recipientAddress,
        svgContent,
        name,
        description,
      });

      if (response.success && response.result?.content?.[0]?.text) {
        const responseText = response.result.content[0].text;

        try {
          const parsedData = JSON.parse(responseText);
          if (parsedData.error) {
            throw new Error(parsedData.message || 'Unknown error occurred');
          }
          return { ...response, parsedData };
        } catch (e) {
          console.error('Failed to parse mint transaction data:', e);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to prepare mint transaction');
      }

      return response;
    },
    enabled: enabled && !!recipientAddress && !!svgContent && !!name,
    staleTime: 0, // Don't cache since each request should be unique
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
