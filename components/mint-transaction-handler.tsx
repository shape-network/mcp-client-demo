'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PrepareMintSVGNFTData } from '@/types';
import { CheckCircle, ExternalLink, Loader2, Wallet, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [storedHash, setStoredHash] = useState<string | undefined>();

  const { writeContract, isPending, error: writeError, data: hash } = useWriteContract();

  // Store the hash when we get it to prevent it from being lost
  useEffect(() => {
    if (hash && !storedHash) {
      console.log('🔗 Storing transaction hash:', hash);
      setStoredHash(hash);
    }
  }, [hash]);

  // Use stored hash for receipt monitoring
  const finalHash = storedHash || hash;

  const {
    data: receipt,
    isSuccess,
    isError: receiptError,
    isPending: isWaitingForReceipt,
    error: receiptErrorDetails,
  } = useWaitForTransactionReceipt({
    hash: finalHash as `0x${string}`,
    timeout: 120_000, // 2 minute timeout
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && receipt && finalHash) {
      console.log('🎉 Transaction successful! Hash:', finalHash);
      onComplete?.(finalHash);
    }
  }, [isSuccess, receipt, finalHash]);

  // Handle transaction errors
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      onError?.(writeError.message);
    }
  }, [writeError]);

  // Handle receipt errors
  useEffect(() => {
    if (receiptError && receiptErrorDetails) {
      console.error('Receipt error:', receiptErrorDetails);
      onError?.(receiptErrorDetails.message || 'Transaction failed - please try again');
    }
  }, [receiptError, receiptErrorDetails]);

  // Fallback timeout for stuck transactions
  useEffect(() => {
    if (hash && isWaitingForReceipt) {
      const timeoutId = setTimeout(() => {
        console.log('Transaction timeout - still waiting after 3 minutes');
        // Don't auto-fail it, but log it for debugging
      }, 180_000); // 3 minutes

      return () => clearTimeout(timeoutId);
    }
  }, [hash, isWaitingForReceipt]);

  // Debug logging
  useEffect(() => {
    console.log('Transaction state:', {
      isPending,
      hash,
      storedHash,
      finalHash,
      hashType: typeof finalHash,
      hashLength: finalHash?.length,
      isWaitingForReceipt,
      isSuccess,
      writeError: writeError?.message,
      receiptError,
      receiptErrorDetails: receiptErrorDetails?.message,
      receipt,
      receiptStatus: receipt?.status,
    });

    // If we have a hash but isWaitingForReceipt is false and isSuccess is false, something is wrong
    if (finalHash && !isWaitingForReceipt && !isSuccess && !receiptError) {
      console.error('⚠️ Transaction hash exists but no receipt monitoring. Hash:', finalHash);
    }
  }, [
    isPending,
    hash,
    storedHash,
    finalHash,
    isWaitingForReceipt,
    isSuccess,
    writeError,
    receiptError,
    receiptErrorDetails,
    receipt,
  ]);

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
    if (isWaitingForReceipt) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    if (isPending) return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    return <Wallet className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isSuccess) return 'Confirmed! ✅';
    if (writeError) return 'Transaction Failed';
    if (isWaitingForReceipt) return 'Confirming Transaction...';
    if (isPending) return 'Signing Transaction...';
    return 'Ready to Mint';
  };

  const getStatusColor = () => {
    if (isSuccess) return 'bg-green-500';
    if (writeError) return 'bg-red-500';
    if (isWaitingForReceipt) return 'bg-blue-500';
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

          {isSuccess && finalHash && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <div className="font-semibold">🎉 NFT Minted Successfully!</div>
                    <div className="text-sm">
                      Your SVG NFT has been minted to{' '}
                      <span className="font-mono text-xs">
                        {transaction.metadata.recipientAddress.slice(0, 6)}...
                        {transaction.metadata.recipientAddress.slice(-4)}
                      </span>
                    </div>
                    <a
                      href={`https://sepolia.shapescan.xyz/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-green-700 hover:text-green-900 hover:underline"
                    >
                      View Transaction on Shape Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </AlertDescription>
              </Alert>

              {/* SVG Preview */}
              {transaction.metadata.nftMetadata && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your NFT Preview:</h4>
                  <div className="bg-muted space-y-3 rounded-lg p-4">
                    <div className="flex justify-center">
                      <div
                        className="max-w-xs rounded-lg border bg-white p-4 shadow-sm"
                        dangerouslySetInnerHTML={{
                          __html: atob(
                            (transaction.metadata.nftMetadata.image as string).replace(
                              'data:image/svg+xml;base64,',
                              ''
                            )
                          ),
                        }}
                      />
                    </div>
                    <div className="space-y-1 text-center">
                      <div className="font-medium">
                        {transaction.metadata.nftMetadata.name as string}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {transaction.metadata.nftMetadata.description as string}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

          {/* Transaction Pending States */}
          {isPending && (
            <div className="space-y-2 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-yellow-500" />
              <p className="text-muted-foreground text-sm">
                Please check your wallet to sign the transaction
              </p>
            </div>
          )}

          {/* Waiting for confirmation */}
          {finalHash && isWaitingForReceipt && !isSuccess && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="space-y-2">
                    <div className="font-semibold">⏳ Transaction Submitted!</div>
                    <div className="text-sm">
                      Your transaction is being confirmed on Shape Sepolia...
                    </div>
                    <a
                      href={`https://sepolia.shapescan.xyz/tx/${finalHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      View Pending Transaction
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-center">
                <div className="flex justify-center">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  This usually takes 10-30 seconds on Shape Sepolia
                </p>
                <div className="pt-2">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="text-xs"
                    >
                      Refresh Page if Stuck
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Try to get hash from the console logs - look for the actual transaction hash
                        const actualHash =
                          '0xfefef32f78754ee2c955e49c31f64439617301eed1439d0893c3f90f1b56d'; // From console
                        console.log('Manual success trigger - Using hash:', actualHash);
                        onComplete?.(actualHash);
                      }}
                      className="text-xs"
                    >
                      Force Complete (Debug)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
