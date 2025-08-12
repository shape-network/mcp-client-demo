'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PrepareMintSVGNFTData } from '@/types';
import { useChat } from '@ai-sdk/react';
import { Bot, Info, Wallet } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { MintTransactionHandler } from './mint-transaction-handler';

export function ChatInterface() {
  const { isConnected } = useAccount();
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error } = useChat();

  const [pendingTransaction, setPendingTransaction] = useState<PrepareMintSVGNFTData | null>(null);

  const getMessageTextContent = useCallback(
    (message: { parts?: Array<{ type?: string; text?: string }> }): string => {
      if (message.parts) {
        return message.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text || '')
          .join('');
      }
      return '';
    },
    []
  );

  const detectTransactionResponse = useCallback(
    (message: {
      parts?: Array<{ type?: string; text?: string }>;
    }): PrepareMintSVGNFTData | null => {
      const content = getMessageTextContent(message);

      try {
        const parsed = JSON.parse(content);
        if (parsed.success && parsed.transaction && parsed.metadata?.functionName === 'mintNFT') {
          return parsed as PrepareMintSVGNFTData;
        }
      } catch {
        const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = content.match(jsonBlockRegex);
        if (match) {
          const parsed = JSON.parse(match[1]);
          if (parsed.success && parsed.transaction && parsed.metadata?.functionName === 'mintNFT') {
            return parsed as PrepareMintSVGNFTData;
          }
        }
        const jsonRegex =
          /\{[\s\S]*"success"\s*:\s*true[\s\S]*"transaction"[\s\S]*"mintNFT"[\s\S]*\}/;
        const jsonMatch = content.match(jsonRegex);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.success && parsed.transaction && parsed.metadata?.functionName === 'mintNFT') {
            return parsed as PrepareMintSVGNFTData;
          }
        }
      }
      return null;
    },
    [getMessageTextContent]
  );

  const handleTransactionComplete = useCallback((hash: string) => {
    console.log('Transaction completed:', hash);
    setPendingTransaction(null);
  }, []);

  const handleTransactionError = useCallback((error: string) => {
    console.error('Transaction failed:', error);
    setPendingTransaction(null);
  }, []);

  // Detect transaction responses in messages
  useEffect(() => {
    if (pendingTransaction) return; // Don't override existing pending transaction

    for (const message of messages) {
      if (message.role === 'assistant') {
        // First check the message content
        let transaction = detectTransactionResponse(message);

        // If not found in content, check tool results
        if (!transaction && message.parts) {
          for (const part of message.parts) {
            if (
              part.type?.startsWith('tool-') &&
              'state' in part &&
              part.state === 'output-available' &&
              part.type === 'tool-prepareMintSVGNFT'
            ) {
              try {
                const toolResult = 'output' in part ? part.output : null;
                if (typeof toolResult === 'string') {
                  const parsed = JSON.parse(toolResult);
                  if (
                    parsed.success &&
                    parsed.transaction &&
                    parsed.metadata?.functionName === 'mintNFT'
                  ) {
                    transaction = parsed as PrepareMintSVGNFTData;
                    break;
                  }
                }
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }

        if (transaction) {
          setPendingTransaction(transaction);
          break; // Only set the first transaction found
        }
      }
    }
  }, [messages, pendingTransaction, detectTransactionResponse]);

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode (rate limited):</strong> Click on assistant responses that used tools to
          expand and view the tool calls and raw responses.
        </AlertDescription>
      </Alert>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Shape Chat Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
              <Wallet className="h-16 w-16 text-gray-300" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground max-w-md">
                  Please connect your wallet to use the Shape AI chatbot.
                </p>
              </div>
              <Alert className="max-w-md">
                <AlertDescription>
                  Click the &quot;Connect Wallet&quot; button in the top right corner to get
                  started.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <Conversation className="h-[400px] sm:h-[720px]">
                <ConversationContent className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-muted-foreground py-8 text-center">
                      <Bot className="mx-auto mb-2 h-12 w-12 opacity-50" />
                      <p>Start a conversation with the Shape assistant!</p>
                      <p className="mt-1 text-sm">
                        Try asking about Shape Network data, how much gasback you can earn or
                        analytics for a given collection.
                      </p>
                    </div>
                  )}

                  {messages.map((message) => {
                    // Check if this message contains a transaction response
                    let transaction: PrepareMintSVGNFTData | null = null;

                    if (message.role === 'assistant') {
                      // First check the message content
                      transaction = detectTransactionResponse(message);

                      // If not found in content, check tool results
                      if (!transaction && message.parts) {
                        for (const part of message.parts) {
                          if (
                            part.type?.startsWith('tool-') &&
                            'state' in part &&
                            part.state === 'output-available' &&
                            part.type === 'tool-prepareMintSVGNFT'
                          ) {
                            try {
                              const toolResult = 'output' in part ? part.output : null;
                              if (typeof toolResult === 'string') {
                                const parsed = JSON.parse(toolResult);
                                if (
                                  parsed.success &&
                                  parsed.transaction &&
                                  parsed.metadata?.functionName === 'mintNFT'
                                ) {
                                  transaction = parsed as PrepareMintSVGNFTData;
                                  break;
                                }
                              }
                            } catch {
                              // Ignore parsing errors
                            }
                          }
                        }
                      }
                    }

                    // If we detect a transaction, set it as pending
                    if (transaction && !pendingTransaction) {
                      setPendingTransaction(transaction);
                    }

                    return (
                      <Message key={message.id} from={message.role}>
                        <MessageContent>
                          <Response>{getMessageTextContent(message)}</Response>

                          {/* Tool calls using AI Elements Tool component */}
                          {message.role === 'assistant' &&
                            message.parts
                              ?.filter((part) => part.type?.startsWith('tool-'))
                              .map((part, index) => (
                                <Tool
                                  key={('toolCallId' in part ? part.toolCallId : null) || index}
                                  defaultOpen={false}
                                >
                                  <ToolHeader
                                    type={(part.type?.startsWith('tool-') ? part.type : 'tool-unknown') as `tool-${string}`}
                                    state={
                                      ('state' in part && part.state) ? part.state as 'input-streaming' | 'input-available' | 'output-available' | 'output-error' : 'input-streaming'
                                    }
                                  />
                                  <ToolContent>
                                    {'input' in part && <ToolInput input={part.input} />}
                                    {'output' in part &&
                                      'state' in part &&
                                      part.state === 'output-available' && (
                                        <ToolOutput
                                          output={
                                            typeof part.output === 'string'
                                              ? part.output
                                              : JSON.stringify(part.output, null, 2)
                                          }
                                          errorText={
                                            'errorText' in part ? part.errorText : undefined
                                          }
                                        />
                                      )}
                                  </ToolContent>
                                </Tool>
                              ))}
                        </MessageContent>
                      </Message>
                    );
                  })}

                  {/* Display transaction handler if there's a pending transaction */}
                  {pendingTransaction && (
                    <div className="mt-4">
                      <MintTransactionHandler
                        transaction={pendingTransaction}
                        onComplete={handleTransactionComplete}
                        onError={handleTransactionError}
                      />
                    </div>
                  )}

                  {(status === 'submitted' || status === 'streaming') && (
                    <div className="flex items-start gap-3">
                      <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                        <Bot className="text-primary-foreground h-4 w-4 animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-1">
                          <div
                            className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>

              <div className="my-4 border-t" />

              {error && (
                <div className="bg-destructive/10 text-destructive mb-4 rounded p-3">
                  <p className="font-medium">
                    {error.message.includes('429') || error.message.includes('rate limit')
                      ? 'Rate Limit Exceeded'
                      : 'Something went wrong'}
                  </p>
                  <p className="text-sm">
                    {error.message.includes('429') || error.message.includes('rate limit')
                      ? "To prevent abuse of API keys, we've set a rate limit. Please wait a moment before trying again."
                      : error.message}
                  </p>
                </div>
              )}

              {/* Suggested prompts - only show when no messages */}
              {messages.length === 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-muted-foreground text-sm">Try these examples:</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {SUGGESTED_PROMPTS.map((suggestion) => (
                      <Button
                        key={suggestion.title}
                        variant="outline"
                        onClick={() => setInput(suggestion.prompt)}
                        disabled={status === 'submitted' || status === 'streaming'}
                        className="h-auto justify-start p-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{suggestion.title}</div>
                          <div className="text-muted-foreground mt-1 line-clamp-3 text-xs break-words">
                            {suggestion.prompt}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <PromptInput
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) {
                    sendMessage({ text: input });
                    setInput('');
                  }
                }}
              >
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a Shape collection, or how much gasback you can earn"
                  disabled={status !== 'ready'}
                  minHeight={48}
                  maxHeight={120}
                />
                <PromptInputSubmit status={status} disabled={status !== 'ready' || !input.trim()} />
              </PromptInput>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const SUGGESTED_PROMPTS = [
  {
    title: 'Collection Analytics',
    prompt: 'Give me data about the DeePle collection (0xf2e4b2a15872a20d0ffb336a89b94ba782ce9ba5)',
  },
  {
    title: 'Gasback Simulator',
    prompt: 'How much gasback do I earn with 1000 tx / day for 6 months?',
  },
  {
    title: 'Shape Network Status & Information',
    prompt: 'Get the current Shape Network status and RPC information',
  },
  {
    title: 'Mint SVG NFT',
    prompt:
      'Create an SVG NFT for me with a simple black circle design, name it "My First Shape NFT" and mint it to my wallet',
  },
];
