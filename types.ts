export type McpTool = {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
  };
};

export type McpStatusResponse = {
  success: boolean;
  message?: string;
  availableTools?: McpTool[];
  error?: string;
};

export type McpResponse = {
  success: boolean;
  result?: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
  error?: string;
  toolName?: string;
};

// Frontend types that match backend output types
export type CollectionAnalyticsData = {
  contractAddress: string;
  timestamp: string;
  name: string | null;
  floorPriceETH: number | null;
  sevenDayVolumeETH: number | null;
  sevenDaySalesCount: number | null;
  averageSalePriceETH: number | null;
  totalSupply: number | null;
  marketCapETH: number | null;
};

export type CreatorAnalyticsData = {
  creatorAddress: string;
  timestamp: string;
  hasTokens: boolean;
  totalTokens: number;
  totalEarnedETH: number;
  currentBalanceETH: number;
  totalWithdrawnETH: number;
  registeredContracts: number;
};

export type TopCreatorsData = {
  timestamp: string;
  totalCreatorsAnalyzed: number;
  topCreators: Array<{
    address: string;
    totalTokens: number;
    totalEarnedETH: number;
    currentBalanceETH: number;
    registeredContracts: number;
  }>;
};

export type ShapeNftData = {
  ownerAddress: string;
  timestamp: string;
  totalNfts: number;
  nfts: Array<{
    tokenId: string;
    contractAddress: string;
    name: string | null;
    imageUrl: string | null;
  }>;
};
