'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useShapeNfts } from '@/hooks/use-mcp';
import { cn } from '@/lib/utils';
import type { OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';

export function ShapeNftViewer() {
  const { address, isConnected } = useAccount();

  const { data, isLoading, error, refetch } = useShapeNfts(address, isConnected);

  const response =
    data && !error
      ? { success: true, result: data.result }
      : error
        ? { success: false, error: error.message }
        : null;
  const nftData = data && 'parsedData' in data ? (data.parsedData as OwnedNftsResponse) : null;

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shape NFTs</CardTitle>
          <CardDescription>Connect your wallet to view your Shape network NFTs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500">
            Please connect your wallet to continue
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Shape NFTs</CardTitle>
            <CardDescription>
              Fetching NFTs for {address?.slice(0, 6)}...{address?.slice(-4)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching NFTs from Shape network...
            </div>
          </div>
        )}

        {response && !isLoading && (
          <Alert
            className={cn({
              'border-green-200 bg-green-50': response.success,
              'border-red-200 bg-red-50': !response.success,
            })}
          >
            <AlertDescription>
              {response.success ? (
                <div>
                  <strong>Success!</strong>
                  {nftData && (
                    <div className="mt-2">
                      <div className="text-sm">
                        Found {nftData.totalCount || 0} NFTs
                        {nftData.ownedNfts?.length > 0 && (
                          <span className="ml-2">(showing {nftData.ownedNfts.length})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <strong>Error:</strong> {response.error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {nftData && (
          <div className="space-y-4">
            {nftData.ownedNfts?.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Your NFTs:</h4>
                {nftData.ownedNfts.slice(0, 5).map((nft: OwnedNft, index: number) => (
                  <div key={index} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{nft.name || `Token #${nft.tokenId}`}</div>
                        <div className="text-xs text-gray-500">{nft.contract.address}</div>
                        {nft.contract.name && (
                          <div className="text-sm text-gray-600">
                            Collection: {nft.contract.name}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{nft.tokenType}</div>
                    </div>
                  </div>
                ))}
                {nftData.ownedNfts.length > 5 && (
                  <div className="text-xs text-gray-500">
                    ...and {nftData.ownedNfts.length - 5} more
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                No NFTs found on Shape network
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                View raw JSON response
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs">
                {JSON.stringify(nftData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
