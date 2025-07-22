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

export type CreatorAnalyticsData = {
  creatorAddress: string;
  hasTokens?: boolean;
  summary?: {
    totalTokens: number;
    totalRegisteredContracts: number;
    uniqueContracts: number;
    totalGasbackEarnedETH: string;
    totalCurrentBalanceETH: string;
    totalWithdrawnETH: string;
    averageEarningsPerToken: string;
    averageEarningsPerContract: string;
  };
  tokens?: Array<{
    tokenId: string;
    totalEarnedETH: string;
    currentBalanceETH: string;
    withdrawnAmountETH: string;
    registeredContractsCount: number;
    registeredContracts: string[];
  }>;
  contractEarnings?: Array<{
    contractAddress: string;
    tokenId: string;
    totalEarnedETH: string;
    balanceUpdatedBlock: string;
  }>;
  timestamp: string;
};

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

export type TopCreatorsData = {
  summary: {
    totalCreators: number;
    totalTokensScanned: number;
    totalEarningsETH: string;
    totalRegisteredContracts: number;
    averageEarningsPerCreator: string;
    topCreatorsShown: number;
  };
  topCreators: Array<{
    address: string;
    totalTokens: number;
    totalEarnedETH: string;
    currentBalanceETH: string;
    totalWithdrawnETH: string;
    totalRegisteredContracts: number;
    averagePerToken: string;
    averagePerContract: string;
    contractDetails?: Array<{
      contractAddress: string;
      tokenId: string;
      totalEarnedETH: string;
    }>;
  }>;
  timestamp: string;
};
