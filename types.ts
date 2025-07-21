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
  floorPrices?: import('alchemy-sdk').GetFloorPriceResponse;
  salesAnalytics?: {
    totalSales: number;
    totalVolumeETH: string;
    averagePriceETH: string;
    marketplaceBreakdown: Record<string, number>;
  };
  collectionInfo?: {
    name: string;
    symbol: string;
    totalSupply: string;
  };
  recentSales?: Array<{
    marketplace: string;
    tokenId: string;
    priceETH: string;
    buyer: string;
    seller: string;
  }>;
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

export type GasbackStatsData = {
  ecosystem: {
    totalTokens: number;
    sampledTokens: number;
    sampleCoverage: string;
    uniqueOwners: number;
    estimatedTotalOwners: number;
    activeTokens: number;
    activeTokenPercentage: string;
  };
  earnings: {
    estimatedTotalEarnedETH: string;
    estimatedCurrentBalanceETH: string;
    estimatedTotalWithdrawnETH: string;
    withdrawalRate: string;
  };
  distribution: {
    medianEarningsETH: string;
    top10PercentileETH: string;
    top5PercentileETH: string;
    averageEarningsPerTokenETH: string;
  };
  contracts: {
    estimatedTotalRegisteredContracts: number;
    averageContractsPerToken: string;
    sampledUniqueContracts: number;
  };
  samples?: {
    topTokensByEarnings: Array<{
      tokenId: string;
      owner: string;
      totalEarnedETH: string;
    }>;
    topContractsByEarnings: Array<{
      contractAddress: string;
      totalEarnedETH: string;
    }>;
  };
  metadata: {
    gasbackContractAddress: string;
    chainId: number;
    dataNote: string;
    timestamp: string;
  };
};
