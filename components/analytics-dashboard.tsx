'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMcpCollectionAnalytics, useMcpShapeCreatorAnalytics } from '@/hooks/use-mcp';
import { cn } from '@/lib/utils';
import type { GetFloorPriceResponse } from 'alchemy-sdk';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  DollarSign,
  LineChart,
  Loader2,
  PieChart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const PRESET_CONTRACTS = [
  {
    name: 'Sample NFT Collection',
    address: '0x1234567890123456789012345678901234567890',
    creator: '0x0987654321098765432109876543210987654321',
    type: 'NFT Collection',
  },
  {
    name: 'DeFi Protocol',
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    creator: '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba',
    type: 'DeFi',
  },
];

const MARKETPLACES = [
  { value: 'seaport', label: 'OpenSea (Seaport)' },
  { value: 'blur', label: 'Blur' },
  { value: 'looksrare', label: 'LooksRare' },
  { value: 'x2y2', label: 'X2Y2' },
  { value: 'wyvern', label: 'OpenSea (Wyvern)' },
  { value: 'cryptopunks', label: 'CryptoPunks' },
];

type CreatorAnalyticsData = {
  contractAddress: string;
  creatorAddress?: string;
  gasbackInfo: {
    isRegistered: boolean;
    totalEarnedETH?: string;
    currentBalanceETH?: string;
  };
  creatorMetrics: {
    totalTransactions: number;
    uniqueUsers: number;
    totalGasUsed: number;
    averageGasPerTx: number;
  };
  recentActivity: Array<{
    hash: string;
    from: string;
    to: string;
    value: number;
    blockNumber: string;
  }>;
};

type CollectionAnalyticsData = {
  contractAddress: string;
  floorPrices?: GetFloorPriceResponse;
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

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <Card className={cn('border-2', colorClasses[color])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className="flex flex-col items-center">
            <Icon className="mb-2 h-8 w-8" />
            {trend && (
              <Badge
                variant={
                  trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'
                }
              >
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreatorAnalyticsForm() {
  const [contractAddress, setContractAddress] = useState('');
  const [creatorAddress, setCreatorAddress] = useState('');
  const [fromBlock, setFromBlock] = useState('');
  const [includeTxDetails, setIncludeTxDetails] = useState(true);

  const {
    mutate: analyzeCreator,
    data: response,
    isPending,
    error,
  } = useMcpShapeCreatorAnalytics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress.trim()) return;

    analyzeCreator({
      contractAddress: contractAddress.trim(),
      creatorAddress: creatorAddress.trim() || undefined,
      fromBlock: fromBlock.trim() || undefined,
      includeTxDetails,
    });
  };

  const loadPreset = (preset: (typeof PRESET_CONTRACTS)[0]) => {
    setContractAddress(preset.address);
    setCreatorAddress(preset.creator);
  };

  let analytics: CreatorAnalyticsData | null = null;
  if (response?.success && response.result?.content?.[0]?.text) {
    try {
      analytics = JSON.parse(response.result.content[0].text);
    } catch (e) {
      console.error('Failed to parse creator analytics:', e);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Shape Creator Analytics
          </CardTitle>
          <CardDescription>
            Analyze gasback earnings, contract interactions, and creator performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contract">Contract Address *</Label>
                <Input
                  id="contract"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creator">Creator Address</Label>
                <Input
                  id="creator"
                  value={creatorAddress}
                  onChange={(e) => setCreatorAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromBlock">From Block</Label>
                <Input
                  id="fromBlock"
                  value={fromBlock}
                  onChange={(e) => setFromBlock(e.target.value)}
                  placeholder="Auto (last 1000 blocks)"
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="includeTx"
                  checked={includeTxDetails}
                  onCheckedChange={setIncludeTxDetails}
                  disabled={isPending}
                />
                <Label htmlFor="includeTx">Include Transaction Details</Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <p className="mb-2 w-full text-sm text-gray-600">Quick presets:</p>
              {PRESET_CONTRACTS.map((preset) => (
                <Button
                  key={preset.address}
                  variant="outline"
                  size="sm"
                  onClick={() => loadPreset(preset)}
                  disabled={isPending}
                >
                  {preset.name}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isPending || !contractAddress.trim()}
              className="w-full"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Creator
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error.message}</AlertDescription>
        </Alert>
      )}

      {analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Transactions"
              value={analytics.creatorMetrics.totalTransactions.toLocaleString()}
              icon={Activity}
              color="blue"
            />
            <MetricCard
              title="Unique Users"
              value={analytics.creatorMetrics.uniqueUsers.toLocaleString()}
              icon={Users}
              color="green"
            />
            <MetricCard
              title="Total Gas Used"
              value={analytics.creatorMetrics.totalGasUsed.toLocaleString()}
              subtitle="wei"
              icon={Zap}
              color="orange"
            />
            <MetricCard
              title="Avg Gas/Tx"
              value={analytics.creatorMetrics.averageGasPerTx.toLocaleString()}
              subtitle="wei"
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gasback Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.gasbackInfo.isRegistered ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Contract is registered for gasback</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-medium text-green-600">Total Earned</p>
                      <p className="text-2xl font-bold text-green-800">
                        {analytics.gasbackInfo.totalEarnedETH} ETH
                      </p>
                    </div>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-600">Current Balance</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {analytics.gasbackInfo.currentBalanceETH} ETH
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Contract is not registered for gasback on Shape</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest {analytics.recentActivity.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.recentActivity.slice(0, 5).map((tx, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-mono text-sm">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">Block {tx.blockNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{tx.value} ETH</p>
                      <p className="text-xs text-gray-500">
                        {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CollectionAnalyticsForm() {
  const [contractAddress, setContractAddress] = useState('');
  const [includeFloorPrice, setIncludeFloorPrice] = useState(true);
  const [includeSalesHistory, setIncludeSalesHistory] = useState(true);
  const [salesHistoryLimit, setSalesHistoryLimit] = useState(20);
  const [marketplace, setMarketplace] = useState<string | undefined>(undefined);

  const {
    mutate: analyzeCollection,
    data: response,
    isPending,
    error,
  } = useMcpCollectionAnalytics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress.trim()) return;

    analyzeCollection({
      contractAddress: contractAddress.trim(),
      includeFloorPrice,
      includeSalesHistory,
      salesHistoryLimit,
      marketplace,
    });
  };

  let analytics: CollectionAnalyticsData | null = null;
  if (response?.success && response.result?.content?.[0]?.text) {
    try {
      analytics = JSON.parse(response.result.content[0].text);
    } catch (e) {
      console.error('Failed to parse collection analytics:', e);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            NFT Collection Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive NFT collection analytics including floor prices and sales data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collectionContract">Collection Contract Address *</Label>
              <Input
                id="collectionContract"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salesLimit">Sales History Limit</Label>
                <Input
                  id="salesLimit"
                  type="number"
                  value={salesHistoryLimit}
                  onChange={(e) => setSalesHistoryLimit(Number(e.target.value))}
                  min={1}
                  max={100}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketplace">Filter by Marketplace</Label>
                <Select
                  value={marketplace}
                  onValueChange={(value) => setMarketplace(value === 'all' ? undefined : value)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All marketplaces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All marketplaces</SelectItem>
                    {MARKETPLACES.map((mp) => (
                      <SelectItem key={mp.value} value={mp.value}>
                        {mp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeFloor"
                  checked={includeFloorPrice}
                  onCheckedChange={setIncludeFloorPrice}
                  disabled={isPending}
                />
                <Label htmlFor="includeFloor">Include Floor Price Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeSales"
                  checked={includeSalesHistory}
                  onCheckedChange={setIncludeSalesHistory}
                  disabled={isPending}
                />
                <Label htmlFor="includeSales">Include Sales History</Label>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isPending || !contractAddress.trim()}
              className="w-full"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Collection
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error.message}</AlertDescription>
        </Alert>
      )}

      {analytics && (
        <div className="space-y-6">
          {analytics.collectionInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Collection Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-600">Name</p>
                    <p className="text-xl font-bold text-blue-800">
                      {analytics.collectionInfo.name}
                    </p>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-600">Symbol</p>
                    <p className="text-xl font-bold text-green-800">
                      {analytics.collectionInfo.symbol}
                    </p>
                  </div>
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <p className="text-sm font-medium text-purple-600">Total Supply</p>
                    <p className="text-xl font-bold text-purple-800">
                      {analytics.collectionInfo.totalSupply}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.salesAnalytics && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Sales"
                value={analytics.salesAnalytics.totalSales.toLocaleString()}
                icon={Activity}
                color="blue"
              />
              <MetricCard
                title="Total Volume"
                value={`${parseFloat(analytics.salesAnalytics.totalVolumeETH).toFixed(2)} ETH`}
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="Average Price"
                value={`${parseFloat(analytics.salesAnalytics.averagePriceETH).toFixed(4)} ETH`}
                icon={TrendingUp}
                color="orange"
              />
              <MetricCard
                title="Marketplaces"
                value={Object.keys(analytics.salesAnalytics.marketplaceBreakdown).length}
                icon={PieChart}
                color="purple"
              />
            </div>
          )}

          {analytics.salesAnalytics?.marketplaceBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Marketplace Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.salesAnalytics.marketplaceBreakdown).map(
                    ([marketplace, count]) => {
                      const percentage = (count / analytics.salesAnalytics!.totalSales) * 100;
                      return (
                        <div key={marketplace} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{marketplace}</span>
                            <span className="text-sm text-gray-600">
                              {count} sales ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.recentSales && analytics.recentSales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest {analytics.recentSales.length} sales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentSales.slice(0, 5).map((sale, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium">Token #{sale.tokenId}</p>
                          <p className="text-xs text-gray-500 capitalize">{sale.marketplace}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{sale.priceETH} ETH</p>
                        <p className="text-xs text-gray-500">
                          {sale.buyer.slice(0, 6)}...{sale.buyer.slice(-4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export function AnalyticsDashboard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-6 w-6" />
          Shape Analytics Dashboard
        </CardTitle>
        <CardDescription>
          Comprehensive analytics for Shape ecosystem contracts and NFT collections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="creator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="creator" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Creator Analytics
            </TabsTrigger>
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Collection Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creator" className="mt-6">
            <CreatorAnalyticsForm />
          </TabsContent>

          <TabsContent value="collection" className="mt-6">
            <CollectionAnalyticsForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
