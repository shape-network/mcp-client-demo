'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@ai-sdk/react';
import { Bot, ChevronDown, ChevronRight, Info, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    api: '/api/chat',
    maxSteps: 5, // Allow up to 5 sequential tool calls
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> Click on assistant responses that used tools to expand and
          view the tool calls and raw responses. This demonstrates the MCP integration and tool
          chaining capabilities.
        </AlertDescription>
      </Alert>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            MCP Chat Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea ref={scrollAreaRef} className="h-[500px] w-full pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-muted-foreground py-8 text-center">
                  <Bot className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>Start a conversation with the MCP assistant!</p>
                  <p className="mt-1 text-sm">Try</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                        <Bot className="text-primary-foreground h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="break-words whitespace-pre-wrap">{message.content}</div>

                      {/* Show tool indicator when tools were used */}
                      {message.role === 'assistant' &&
                        message.parts?.some((part) => part.type === 'tool-invocation') && (
                          <button
                            onClick={() => toggleMessageExpansion(message.id)}
                            className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-2 text-xs transition-colors hover:bg-muted/50 rounded p-1 -ml-1"
                          >
                            {expandedMessages.has(message.id) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                            <span>
                              🔧{' '}
                              {
                                message.parts.filter((part) => part.type === 'tool-invocation')
                                  .length
                              }{' '}
                              tool
                              {message.parts.filter((part) => part.type === 'tool-invocation')
                                .length > 1
                                ? 's'
                                : ''}{' '}
                              used
                            </span>
                          </button>
                        )}

                      {/* Display tool calls if expanded */}
                      {expandedMessages.has(message.id) &&
                        message.parts?.some((part) => part.type === 'tool-invocation') && (
                          <div className="mt-3 border-t pt-3">
                            <div className="space-y-3">
                              {message.parts
                                .filter((part) => part.type === 'tool-invocation')
                                .map((part, index) => (
                                  <div key={part.toolInvocation.toolCallId} className="space-y-2">
                                    <div className="text-muted-foreground text-xs font-medium">
                                      Step {index + 1}: {part.toolInvocation.toolName}
                                    </div>
                                    {part.toolInvocation.state === 'result' && (
                                      <div className="bg-background/50 rounded p-2 text-sm">
                                        <pre className="overflow-x-auto whitespace-pre-wrap">
                                          {JSON.stringify(part.toolInvocation.result, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {part.toolInvocation.state === 'call' && (
                                      <div className="rounded bg-blue-50 p-2 text-sm text-blue-700">
                                        Executing tool...
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {message.role === 'user' && (
                      <div className="bg-muted flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

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
            </div>
          </ScrollArea>

          <Separator />

          {error && (
            <div className="bg-destructive/10 text-destructive mb-4 rounded p-3">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about blockchain data, Web3 operations, or Shape Network..."
              disabled={status === 'submitted' || status === 'streaming'}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={status === 'submitted' || status === 'streaming' || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
