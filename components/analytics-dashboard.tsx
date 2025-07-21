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
import {
  useCollectionAnalytics,
  useShapeCreatorAnalytics,
  useTopShapeCreators,
} from '@/hooks/use-mcp';
import { cn } from '@/lib/utils';
import type { CollectionAnalyticsData, CreatorAnalyticsData, TopCreatorsData } from '@/types';
import {
  Activity,
  AlertCircle,
  BarChart3,
  DollarSign,
  LineChart,
  Loader2,
  PieChart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const MARKETPLACES = [
  { value: 'seaport', label: 'OpenSea (Seaport)' },
  { value: 'blur', label: 'Blur' },
  { value: 'looksrare', label: 'LooksRare' },
  { value: 'x2y2', label: 'X2Y2' },
  { value: 'wyvern', label: 'OpenSea (Wyvern)' },
  { value: 'cryptopunks', label: 'CryptoPunks' },
];

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
  const [creatorAddress, setCreatorAddress] = useState('');

  const {
    data: response,
    isLoading: isPending,
    error,
    refetch,
  } = useShapeCreatorAnalytics(
    creatorAddress.trim() || undefined,
    false // Start disabled, use manual refetch
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorAddress.trim()) return;
    refetch();
  };

  let analytics: CreatorAnalyticsData | null = null;
  let parseError: string | null = null;

  if (response?.success && response.result?.content?.[0]?.text) {
    try {
      const parsed = JSON.parse(response.result.content[0].text);

      if (parsed.error) {
        parseError = parsed.message || 'Unknown error occurred';
      } else if (parsed.hasTokens === false) {
        analytics = parsed;
      } else if (parsed.summary) {
        analytics = parsed;
      } else {
        parseError = 'Invalid response format';
      }
    } catch (e) {
      console.error('Failed to parse creator analytics:', e);
      parseError = 'Failed to parse server response';
    }
  } else if (response && 'parsedData' in response && response.parsedData) {
    analytics = response.parsedData;
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
            Analyze gasback earnings, token count, and registered contracts for a Shape creator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="creator">Creator Address *</Label>
              <Input
                id="creator"
                value={creatorAddress}
                onChange={(e) => setCreatorAddress(e.target.value)}
                placeholder="0x..."
                disabled={isPending}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isPending || !creatorAddress.trim()}
                className="flex-1"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Creator
              </Button>
              <Button
                onClick={() => refetch()}
                disabled={isPending || !creatorAddress.trim()}
                variant="outline"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(error || parseError) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {parseError || error?.message}
          </AlertDescription>
        </Alert>
      )}

      {analytics && analytics.hasTokens === false && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Creator has no gasback tokens on Shape
          </AlertDescription>
        </Alert>
      )}

      {analytics && analytics.summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Tokens"
              value={analytics.summary.totalTokens.toLocaleString()}
              icon={Activity}
              color="blue"
            />
            <MetricCard
              title="Registered Contracts"
              value={analytics.summary.totalRegisteredContracts.toLocaleString()}
              icon={Users}
              color="green"
            />
            <MetricCard
              title="Total Earned"
              value={`${parseFloat(analytics.summary.totalGasbackEarnedETH).toFixed(6)} ETH`}
              icon={DollarSign}
              color="orange"
            />
            <MetricCard
              title="Current Balance"
              value={`${parseFloat(analytics.summary.totalCurrentBalanceETH).toFixed(6)} ETH`}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-2 border-red-200 bg-red-50 text-red-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-red-600">Total Withdrawn</p>
                    <p className="text-2xl font-bold">
                      {parseFloat(analytics.summary.totalWithdrawnETH).toFixed(6)} ETH
                    </p>
                  </div>
                  <Zap className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-indigo-200 bg-indigo-50 text-indigo-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-indigo-600">Avg per Token</p>
                    <p className="text-2xl font-bold">
                      {parseFloat(analytics.summary.averageEarningsPerToken).toFixed(6)} ETH
                    </p>
                  </div>
                  <PieChart className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-pink-200 bg-pink-50 text-pink-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-pink-600">Avg per Contract</p>
                    <p className="text-2xl font-bold">
                      {parseFloat(analytics.summary.averageEarningsPerContract).toFixed(6)} ETH
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </div>

          {analytics.tokens && analytics.tokens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gasback Tokens</CardTitle>
                <CardDescription>
                  Token-level gasback analytics ({analytics.tokens.length} tokens)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.tokens.slice(0, 10).map((token, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                          #{token.tokenId}
                        </div>
                        <div>
                          <p className="font-medium">Token #{token.tokenId}</p>
                          <p className="text-sm text-gray-500">
                            {token.registeredContractsCount} contracts
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {parseFloat(token.totalEarnedETH).toFixed(6)} ETH
                        </p>
                        <p className="text-sm text-gray-500">
                          Balance: {parseFloat(token.currentBalanceETH).toFixed(6)} ETH
                        </p>
                      </div>
                    </div>
                  ))}
                  {analytics.tokens.length > 10 && (
                    <p className="text-center text-sm text-gray-500">
                      ... and {analytics.tokens.length - 10} more tokens
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.contractEarnings && analytics.contractEarnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contract Earnings</CardTitle>
                <CardDescription>
                  Earnings breakdown by registered contracts ({analytics.contractEarnings.length}{' '}
                  contracts)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.contractEarnings.slice(0, 10).map((contract, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-mono text-sm">
                            {contract.contractAddress.slice(0, 10)}...
                            {contract.contractAddress.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500">Token #{contract.tokenId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {parseFloat(contract.totalEarnedETH).toFixed(6)} ETH
                        </p>
                        <p className="text-xs text-gray-500">
                          Block {contract.balanceUpdatedBlock}
                        </p>
                      </div>
                    </div>
                  ))}
                  {analytics.contractEarnings.length > 10 && (
                    <p className="text-center text-sm text-gray-500">
                      ... and {analytics.contractEarnings.length - 10} more contracts
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
    data: response,
    isLoading: isPending,
    error,
    refetch,
  } = useCollectionAnalytics(
    contractAddress.trim() || undefined,
    {
      includeFloorPrice,
      includeSalesHistory,
      salesHistoryLimit,
      marketplace,
    },
    false // Start disabled, use manual refetch
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress.trim()) return;
    refetch();
  };

  let analytics: CollectionAnalyticsData | null = null;
  if (response?.success && response.result?.content?.[0]?.text) {
    try {
      analytics = JSON.parse(response.result.content[0].text);
    } catch (e) {
      console.error('Failed to parse collection analytics:', e);
    }
  } else if (response && 'parsedData' in response && response.parsedData) {
    analytics = response.parsedData;
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
                onChange={(e) => {
                  setContractAddress(e.target.value);
                }}
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
                  onChange={(e) => {
                    setSalesHistoryLimit(Number(e.target.value));
                  }}
                  min={1}
                  max={100}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketplace">Filter by Marketplace</Label>
                <Select
                  value={marketplace}
                  onValueChange={(value) => {
                    setMarketplace(value === 'all' ? undefined : value);
                  }}
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
                  onCheckedChange={(checked) => {
                    setIncludeFloorPrice(checked);
                  }}
                  disabled={isPending}
                />
                <Label htmlFor="includeFloor">Include Floor Price Data</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeSales"
                  checked={includeSalesHistory}
                  onCheckedChange={(checked) => {
                    setIncludeSalesHistory(checked);
                  }}
                  disabled={isPending}
                />
                <Label htmlFor="includeSales">Include Sales History</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isPending || !contractAddress.trim()}
                className="flex-1"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Collection
              </Button>
              <Button
                onClick={() => refetch()}
                disabled={isPending || !contractAddress.trim()}
                variant="outline"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh
              </Button>
            </div>
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

          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              View raw JSON response
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs">
              {JSON.stringify(analytics, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function TopShapeCreatorsForm() {
  const [limit, setLimit] = useState(50);
  const [includeContractDetails, setIncludeContractDetails] = useState(false);

  const {
    data: response,
    isLoading: isPending,
    error,
    refetch,
  } = useTopShapeCreators(limit, includeContractDetails, false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  let topCreators: TopCreatorsData | null = null;
  if (response?.success && response.result?.content?.[0]?.text) {
    try {
      topCreators = JSON.parse(response.result.content[0].text);
    } catch (e) {
      console.error('Failed to parse top creators:', e);
    }
  } else if (response && 'parsedData' in response && response.parsedData) {
    topCreators = response.parsedData;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Shape Creators
          </CardTitle>
          <CardDescription>
            Discover the top creators on Shape by gasback earnings and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="limit">Number of Creators</Label>
                <Input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  min={1}
                  max={100}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="includeDetails"
                  checked={includeContractDetails}
                  onCheckedChange={setIncludeContractDetails}
                  disabled={isPending}
                />
                <Label htmlFor="includeDetails">Include Contract Details</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Top Creators
              </Button>
              <Button onClick={() => refetch()} disabled={isPending} variant="outline">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error.message}</AlertDescription>
        </Alert>
      )}

      {topCreators && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Creators"
              value={topCreators.summary.totalCreators.toLocaleString()}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Total Earnings"
              value={`${parseFloat(topCreators.summary.totalEarningsETH).toFixed(2)} ETH`}
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Tokens Scanned"
              value={topCreators.summary.totalTokensScanned.toLocaleString()}
              icon={Activity}
              color="orange"
            />
            <MetricCard
              title="Avg per Creator"
              value={`${parseFloat(topCreators.summary.averageEarningsPerCreator).toFixed(4)} ETH`}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Creators by Gasback Earnings</CardTitle>
              <CardDescription>
                Showing top {topCreators.topCreators.length} creators ranked by total gasback
                earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCreators.topCreators.slice(0, 20).map((creator, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm">
                          {creator.address.slice(0, 10)}...{creator.address.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {creator.totalTokens} tokens • {creator.totalRegisteredContracts}{' '}
                          contracts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {parseFloat(creator.totalEarnedETH).toFixed(4)} ETH
                      </p>
                      <p className="text-xs text-gray-500">
                        Balance: {parseFloat(creator.currentBalanceETH).toFixed(4)} ETH
                      </p>
                    </div>
                  </div>
                ))}
                {topCreators.topCreators.length > 20 && (
                  <p className="text-center text-sm text-gray-500">
                    ... and {topCreators.topCreators.length - 20} more creators
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              View raw JSON response
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs">
              {JSON.stringify(topCreators, null, 2)}
            </pre>
          </details>
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
        <Tabs defaultValue="top-creators" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="top-creators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Creators
            </TabsTrigger>
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

          <TabsContent value="top-creators" className="mt-6">
            <TopShapeCreatorsForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
