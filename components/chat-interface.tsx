'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@ai-sdk/react';
import { Bot, Info, Send, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status, error } = useChat({
    api: '/api/chat',
    maxSteps: 5, // Allow up to 5 sequential tool calls
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Demo Mode:</strong> This chatbot shows tool calls and raw responses for
          demonstration purposes. In production, you would typically hide these implementation
          details and only show the final user-friendly results.
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

                      {/* Display tool calls if present */}
                      {message.toolInvocations?.map((toolInvocation) => (
                        <div key={toolInvocation.toolCallId} className="mt-3 border-t pt-3">
                          <div className="text-muted-foreground mb-2 text-xs font-medium">
                            🔧 Called tool: {toolInvocation.toolName}
                          </div>
                          {toolInvocation.state === 'result' && (
                            <div className="bg-background/50 rounded p-2 text-sm">
                              <pre className="overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(toolInvocation.result, null, 2)}
                              </pre>
                            </div>
                          )}
                          {toolInvocation.state === 'call' && (
                            <div className="rounded bg-blue-50 p-2 text-sm text-blue-700">
                              Calling tool...
                            </div>
                          )}
                        </div>
                      ))}
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
