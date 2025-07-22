'use client';

import { McpResponse, McpStatusResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';
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

export function useShapeNfts(address: Address | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['shape-nfts', address],
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

export function useShapeCreatorAnalytics(
  creatorAddress: string | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['shape-creator-analytics', creatorAddress],
    queryFn: async () => {
      const response = await callMcpTool('getShapeCreatorAnalytics', {
        creatorAddress: creatorAddress!,
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
          console.error('Failed to parse creator analytics:', e);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch creator analytics');
      }

      return response;
    },
    enabled: enabled && !!creatorAddress,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useCollectionAnalytics(
  contractAddress: string | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['collection-analytics', contractAddress],
    queryFn: async () => {
      const response = await callMcpTool('getCollectionAnalytics', {
        contractAddress: contractAddress,
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
          console.error('Failed to parse collection analytics:', e);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch collection analytics');
      }

      return response;
    },
    enabled: enabled && !!contractAddress,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useTopShapeCreators(enabled: boolean = true) {
  return useQuery({
    queryKey: ['mcp', 'top-shape-creators'],
    queryFn: async () => {
      const response = await callMcpTool('getTopShapeCreators', {});

      if (response.success && response.result?.content?.[0]?.text) {
        const responseText = response.result.content[0].text;

        try {
          const parsedData = JSON.parse(responseText);
          if (parsedData.error) {
            throw new Error(parsedData.message || 'Unknown error occurred');
          }
          return { ...response, parsedData };
        } catch (e) {
          console.error('Failed to parse top creators data:', e);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch top creators');
      }

      return response;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export function useStackAchievements(userAddress: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stack-achievements', userAddress],
    queryFn: async () => {
      const response = await callMcpTool('getStackAchievements', {
        userAddress: userAddress!,
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
          console.error('Failed to parse stack achievements:', e);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch stack achievements');
      }

      return response;
    },
    enabled: enabled && !!userAddress,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
