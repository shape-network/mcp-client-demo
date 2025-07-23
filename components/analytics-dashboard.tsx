'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useCollectionAnalytics,
  useShapeCreatorAnalytics,
  useStackAchievements,
  useTopShapeCreators,
} from '@/hooks/use-mcp';
import { cn } from '@/lib/utils';
import type {
  CollectionAnalyticsData,
  CreatorAnalyticsData,
  StackAchievementsData,
  TopCreatorsData,
} from '@/types';
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
import Image from 'next/image';
import { useState } from 'react';

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
      } else {
        analytics = parsed;
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

      {analytics &&
        analytics.totalGasbackEarnedETH === 0 &&
        analytics.registeredContracts === 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Creator has no gasback activity on Shape
            </AlertDescription>
          </Alert>
        )}

      {analytics && (analytics.totalGasbackEarnedETH > 0 || analytics.registeredContracts > 0) && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator: {analytics.ensName || analytics.address}</CardTitle>
              <CardDescription>Gasback analytics for this Shape creator</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Registered Contracts"
              value={analytics.registeredContracts.toLocaleString()}
              icon={Users}
              color="green"
            />

            <MetricCard
              title="Total Earned"
              value={`${analytics.totalGasbackEarnedETH.toFixed(6)} ETH`}
              icon={DollarSign}
              color="orange"
            />

            <MetricCard
              title="Current Balance"
              value={`${analytics.currentBalanceETH.toFixed(6)} ETH`}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            <Card className="border-2 border-pink-200 bg-pink-50 text-pink-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-pink-600">Avg per Contract</p>
                    <p className="text-2xl font-bold">
                      {analytics.registeredContracts > 0
                        ? (analytics.totalGasbackEarnedETH / analytics.registeredContracts).toFixed(
                            6
                          )
                        : '0'}{' '}
                      ETH
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200 bg-gray-50 text-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-600">Data Age</p>
                    <p className="text-sm font-bold">Real-time</p>
                    <p className="text-xs text-gray-500">
                      {new Date(analytics.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <LineChart className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </div>

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

function CollectionAnalyticsForm() {
  const [contractAddress, setContractAddress] = useState('');

  const {
    data: response,
    isLoading: isPending,
    error,
    refetch,
  } = useCollectionAnalytics(contractAddress.trim() || undefined, false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress.trim()) return;
    refetch();
  };

  let analytics: CollectionAnalyticsData | null = null;
  let parseError: string | null = null;

  if (response?.success && response.result?.content?.[0]?.text) {
    try {
      const parsed = JSON.parse(response.result.content[0].text);
      if (parsed.error) {
        parseError = parsed.message || 'Unknown error occurred';
      } else {
        analytics = parsed;
      }
    } catch (e) {
      console.error('Failed to parse collection analytics:', e);
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
            <PieChart className="h-5 w-5" />
            NFT Collection Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive NFT collection analysis: supply, holders, token standard, sample NFTs, and
            marketplace floor prices
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

      {(error || parseError) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {parseError || error?.message}
          </AlertDescription>
        </Alert>
      )}

      {analytics && (
        <div className="space-y-6">
          {analytics.name && (
            <Card>
              <CardHeader>
                <CardTitle>Collection: {analytics.name}</CardTitle>
                <CardDescription>
                  {analytics.symbol && `Symbol: ${analytics.symbol} • `}
                  Contract: {analytics.contractAddress}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {analytics.totalSupply !== null && (
              <MetricCard
                title="Total Supply"
                value={analytics.totalSupply.toLocaleString()}
                icon={PieChart}
                color="blue"
              />
            )}
            {analytics.ownerCount !== null && (
              <MetricCard
                title="Unique Holders"
                value={analytics.ownerCount.toLocaleString()}
                icon={Users}
                color="green"
              />
            )}
            {analytics.contractType && (
              <MetricCard
                title="Token Standard"
                value={analytics.contractType}
                icon={Activity}
                color="orange"
              />
            )}
            {analytics.sampleNfts.length > 0 && (
              <MetricCard
                title="Sample NFTs"
                value={analytics.sampleNfts.length.toString()}
                subtitle="Available"
                icon={LineChart}
                color="purple"
              />
            )}
          </div>

          {analytics.floorPrice &&
            (analytics.floorPrice.openSea || analytics.floorPrice.looksRare) && (
              <Card>
                <CardHeader>
                  <CardTitle>Floor Prices</CardTitle>
                  <CardDescription>Current marketplace floor prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {analytics.floorPrice.openSea && (
                      <div className="rounded-lg border bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-700">OpenSea</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {analytics.floorPrice.openSea.floorPrice}{' '}
                              {analytics.floorPrice.openSea.priceCurrency}
                            </p>
                            {analytics.floorPrice.openSea.collectionUrl && (
                              <a
                                href={analytics.floorPrice.openSea.collectionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline"
                              >
                                View Collection
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {analytics.floorPrice.looksRare && (
                      <div className="rounded-lg border bg-green-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700">LooksRare</p>
                            <p className="text-2xl font-bold text-green-900">
                              {analytics.floorPrice.looksRare.floorPrice}{' '}
                              {analytics.floorPrice.looksRare.priceCurrency}
                            </p>
                            {analytics.floorPrice.looksRare.collectionUrl && (
                              <a
                                href={analytics.floorPrice.looksRare.collectionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 underline"
                              >
                                View Collection
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {analytics.sampleNfts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sample NFTs from Collection</CardTitle>
                <CardDescription>
                  Preview of {analytics.sampleNfts.length} NFTs from this collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {analytics.sampleNfts.map((nft, idx) => (
                    <div key={idx} className="rounded-lg border bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        {nft.imageUrl && (
                          <Image
                            src={nft.imageUrl}
                            alt={nft.name || `Token #${nft.tokenId}`}
                            className="h-16 w-16 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{nft.name || `Token #${nft.tokenId}`}</p>
                          <p className="text-sm text-gray-500">#{nft.tokenId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-gray-200 bg-gray-50 text-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">Data Source</p>
                  <p className="text-sm font-bold">onchain Analysis</p>
                  <p className="text-xs text-gray-500">
                    {new Date(analytics.timestamp).toLocaleString()}
                  </p>
                </div>
                <Zap className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

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
  const { data: response, isLoading: isPending, error, refetch } = useTopShapeCreators(false);

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Creators"
              value={topCreators.totalCreatorsAnalyzed.toLocaleString()}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Top Creators Shown"
              value={topCreators.topCreators.length.toLocaleString()}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard
              title="Data Updated"
              value={new Date(topCreators.timestamp).toLocaleTimeString()}
              subtitle={new Date(topCreators.timestamp).toLocaleDateString()}
              icon={Activity}
              color="orange"
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
                        <p className="font-mono text-sm">{creator.ensName ?? creator.address}</p>
                        <p className="text-xs text-gray-500">
                          {creator.registeredContracts} contracts
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {creator.totalGasbackEarnedETH.toFixed(4)} ETH
                      </p>
                      <p className="text-xs text-gray-500">
                        Balance: {creator.currentBalanceETH.toFixed(4)} ETH
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

function StackAchievementsForm() {
  const [userAddress, setUserAddress] = useState('');

  const {
    data: response,
    isLoading: isPending,
    error,
    refetch,
  } = useStackAchievements(userAddress.trim() || undefined, false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress.trim()) return;
    refetch();
  };

  let achievements: StackAchievementsData | null = null;
  let parseError: string | null = null;

  if (response?.success && response.result?.content?.[0]?.text) {
    try {
      const parsed = JSON.parse(response.result.content[0].text);

      if (parsed.error) {
        parseError = parsed.message || 'Unknown error occurred';
      } else {
        achievements = parsed;
      }
    } catch (e) {
      console.error('Failed to parse stack achievements:', e);
      parseError = 'Failed to parse server response';
    }
  } else if (response && 'parsedData' in response && response.parsedData) {
    achievements = response.parsedData;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Stack Achievements
          </CardTitle>
          <CardDescription>
            Track Stack medals and achievements on Shape - dynamic NFTs for contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userAddress">User Address *</Label>
              <Input
                id="userAddress"
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                placeholder="0x..."
                disabled={isPending}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isPending || !userAddress.trim()}
                className="flex-1"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Achievements
              </Button>
              <Button
                onClick={() => refetch()}
                disabled={isPending || !userAddress.trim()}
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

      {achievements && !achievements.hasStack && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            User does not have a Stack NFT on Shape
          </AlertDescription>
        </Alert>
      )}

      {achievements && achievements.hasStack && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User: {achievements.userAddress}</CardTitle>
              <CardDescription>Stack achievements and medal counts</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Medals"
              value={achievements.totalMedals.toLocaleString()}
              icon={Activity}
              color="blue"
            />
            <MetricCard
              title="Bronze Medals"
              value={achievements.medalsByTier.bronze.toLocaleString()}
              icon={DollarSign}
              color="orange"
            />
            <MetricCard
              title="Silver Medals"
              value={achievements.medalsByTier.silver.toLocaleString()}
              icon={Users}
              color="green"
            />
            <MetricCard
              title="Gold + Special"
              value={(
                achievements.medalsByTier.gold + achievements.medalsByTier.special
              ).toLocaleString()}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {achievements.lastMedalClaimed && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Achievement</CardTitle>
                <CardDescription>Most recently claimed medal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Medal #{achievements.lastMedalClaimed.medalUID.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-gray-500">
                      Claimed: {new Date(achievements.lastMedalClaimed.claimedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-gray-200 bg-gray-50 text-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-600">Achievement Data</p>
                  <p className="text-sm font-bold">Real-time</p>
                  <p className="text-xs text-gray-500">
                    {new Date(achievements.timestamp).toLocaleString()}
                  </p>
                </div>
                <Zap className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              View raw JSON response
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs">
              {JSON.stringify(achievements, null, 2)}
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
          Comprehensive analytics for Shape ecosystem: gasback creators, NFT collections with floor
          prices, and Stack achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="top-creators" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="stack" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Stack Achievements
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

          <TabsContent value="stack" className="mt-6">
            <StackAchievementsForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
