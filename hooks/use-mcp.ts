'use client';

import { McpResponse, McpStatusResponse } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

async function checkMcpServerStatus(): Promise<McpStatusResponse> {
  const res = await fetch('/api/call-mcp-tool');
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}

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

export function useMcpServerStatus() {
  return useQuery({
    queryKey: ['mcp-status'],
    queryFn: checkMcpServerStatus,
    refetchInterval: 60 * 5 * 1000,
    staleTime: 30 * 1000,
  });
}

export function useMcpTool() {
  return useMutation({
    mutationFn: ({
      toolName,
      parameters,
    }: {
      toolName: string;
      parameters?: Record<string, unknown>;
    }) => callMcpTool(toolName, parameters),
    onError: (error) => {
      console.error('MCP tool call failed:', error);
    },
  });
}

export function useMcpGreet() {
  return useMutation({
    mutationFn: (name: string) => callMcpTool('greet', { name: name.trim() }),
    onError: (error) => {
      console.error('Greet tool failed:', error);
    },
  });
}

export function useMcpShapeNft() {
  return useMutation({
    mutationFn: ({
      address,
      withMetadata = true,
      pageSize = 10,
    }: {
      address: Address;
      withMetadata?: boolean;
      pageSize?: number;
    }) => callMcpTool('getShapeNft', { address, withMetadata, pageSize }),
    onError: (error) => {
      console.error('Shape NFT tool failed:', error);
    },
  });
}

export function useShapeNfts(address: Address | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['mcp', 'shape-nfts', address],
    queryFn: async () => {
      const response = await callMcpTool('getShapeNft', {
        address,
        withMetadata: true,
        pageSize: 10,
      });

      if (response.success && response.result?.content?.[0]?.text) {
        const responseText = response.result.content[0].text;

        if (responseText.startsWith('Error:')) {
          throw new Error(responseText);
        } else {
          try {
            const parsedData = JSON.parse(responseText);
            return { ...response, parsedData };
          } catch (e) {
            console.error('Failed to parse NFT data:', e);
            throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
          }
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch Shape NFTs');
      }

      return response;
    },
    enabled: enabled && !!address,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
