'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PrepareMintSVGNFTData } from '@/types';
import { CheckCircle, ExternalLink, Loader2, Wallet, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

type MintTransactionHandlerProps = {
  transaction: PrepareMintSVGNFTData;
  onComplete?: (hash: string) => void;
  onError?: (error: string) => void;
};

export function MintTransactionHandler({
  transaction,
  onComplete,
  onError,
}: MintTransactionHandlerProps) {
  const { address, isConnected } = useAccount();

  const { writeContract, isPending, error: writeError, data: hash } = useWriteContract();

  const {
    data: receipt,
    isSuccess,
    isError: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && receipt && hash) {
      onComplete?.(hash);
    }
  }, [isSuccess, receipt, hash, onComplete]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      onError?.(writeError.message);
    }
  }, [writeError, onError]);

  const handleMint = () => {
    if (!isConnected || !address) {
      onError?.('Please connect your wallet first');
      return;
    }

    writeContract({
      address: transaction.transaction.to as `0x${string}`,
      abi: [
        {
          name: 'mintNFT',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'recipient', type: 'address' },
            { name: 'tokenURI', type: 'string' },
          ],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ],
      functionName: 'mintNFT',
      args: [transaction.metadata.recipientAddress as `0x${string}`, transaction.metadata.tokenURI],
    });
  };

  const getStatusIcon = () => {
    if (isSuccess) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (writeError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (isPending) return <Loader2 className="h-4 w-4 animate-spin" />;
    return <Wallet className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isSuccess) return 'NFT Minted Successfully!';
    if (writeError) return 'Transaction Failed';
    if (isPending) return 'Signing Transaction...';
    return 'Ready to Mint';
  };

  const getStatusColor = () => {
    if (isSuccess) return 'bg-green-500';
    if (writeError) return 'bg-red-500';
    if (isPending) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          NFT Mint Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span className="font-mono text-xs">
                {transaction.metadata.recipientAddress.slice(0, 6)}...
                {transaction.metadata.recipientAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract:</span>
              <span className="font-mono text-xs">
                {transaction.metadata.contractAddress.slice(0, 6)}...
                {transaction.metadata.contractAddress.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Gas:</span>
              <span>{transaction.metadata.estimatedGas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chain:</span>
              <span>Shape Sepolia (Chain ID: {transaction.metadata.chainId})</span>
            </div>
          </div>

          {transaction.metadata.nftMetadata && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">NFT Details:</h4>
              <div className="bg-muted rounded p-3 text-sm">
                <div className="space-y-1">
                  <div>
                    <strong>Name:</strong> {transaction.metadata.nftMetadata.name as string}
                  </div>
                  <div>
                    <strong>Description:</strong>{' '}
                    {transaction.metadata.nftMetadata.description as string}
                  </div>
                  <div>
                    <strong>Format:</strong> SVG
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSuccess && hash && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Transaction successful!{' '}
                <a
                  href={`https://sepolia.shapescan.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  View on Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          {(writeError || receiptError) && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{writeError?.message || 'Transaction failed'}</AlertDescription>
            </Alert>
          )}

          {!isSuccess && !writeError && (
            <div className="space-y-3">
              <Button onClick={handleMint} disabled={!isConnected || isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  'Mint NFT'
                )}
              </Button>

              <div className="text-muted-foreground space-y-1 text-xs">
                <p>• This will open your wallet to sign the transaction</p>
                <p>• No ETH value is required for this transaction</p>
                <p>• The NFT will be minted to the specified recipient address</p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="space-y-2 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Please check your wallet to sign the transaction
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
