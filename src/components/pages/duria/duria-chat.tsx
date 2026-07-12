"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDuria } from '@/components/providers/duria-provider';
import { Paperclip, Send, User, Loader2, X } from 'lucide-react';
import { DuriaAvatar } from '@/components/shared/duria-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import ProposalCard from './proposal-card';
import { getAIUsage } from '@/server/actions/ai-usage';

const ContextAttachDialog = dynamic(() => import('./context-attach-dialog'), {
  ssr: false,
});

const MESSAGE_LIMIT = 2000;

function getMessageText(msg: any) {
  return msg.content ||
    msg.parts?.find((part: any) => part.type === 'text')?.text ||
    "";
}

function getProposalToolCalls(msg: any) {
  const legacyToolCalls = (msg.toolInvocations || []).map((toolInvocation: any) => ({
    toolCallId: toolInvocation.toolCallId,
    toolName: toolInvocation.toolName,
    args: toolInvocation.args ?? toolInvocation.input ?? {},
    result: toolInvocation.result ?? toolInvocation.output,
    state: toolInvocation.state,
  }));

  const partToolCalls = (msg.parts || [])
    .filter((part: any) => typeof part.type === 'string' && part.type.startsWith('tool-'))
    .map((part: any) => ({
      toolCallId: part.toolCallId,
      toolName: part.toolName || part.type.replace(/^tool-/, ''),
      args: part.input ?? {},
      result: part.output,
      state: part.state,
    }));

  return [...legacyToolCalls, ...partToolCalls].filter((toolCall: any) => toolCall.toolName);
}

export default function DuriaChat() {
  const { aiPayload, removeContextItem, clearContext } = useDuria();
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [input, setInput] = useState('');
  const [hasAskedToClear, setHasAskedToClear] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [proposalStatus, setProposalStatus] = useState<Record<string, 'pending' | 'confirmed' | 'cancelled' | 'error'>>({});

  const totalContextItems = aiPayload.todos.length + aiPayload.notes.length + aiPayload.events.length + aiPayload.docs.length;
  const refreshUsage = useCallback(async () => {
    setIsUsageLoading(true);
    const response = await getAIUsage();
    if (response.success && response.data) {
      setUsage(response.data);
    }
    setIsUsageLoading(false);
  }, []);

  const { messages, status, sendMessage, error } = useChat({
    // @ts-ignore - Ignore type error for useChat options
    api: '/api/chat',
    body: {
      contextPayload: aiPayload
    },
    onFinish: refreshUsage,
  }) as any;

  const isLoading = status === 'submitted' || status === 'streaming';
  const trimmedInput = input.trim();
  const trimmedInputLength = trimmedInput.length;
  const isMessageTooLong = trimmedInputLength > MESSAGE_LIMIT;
  const shouldShowCharacterCount = trimmedInputLength >= MESSAGE_LIMIT * 0.8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedInput || isLoading || isMessageTooLong) return;
    setHasAskedToClear(false);
    // @ts-ignore
    sendMessage({ role: 'user', content: trimmedInput });
    setInput('');
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  return (
    <div className="flex flex-col h-full bg-secondary/10">
      {/* Header */}
      <div className="h-14 border-b border-border/50 bg-card flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <DuriaAvatar size={20} />
          <h2 className="font-semibold">DURIA</h2>
        </div>
        <AIUsageIndicator usage={usage} isLoading={isUsageLoading} />
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
             <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center text-center mb-8">
                  <DuriaAvatar size={80} className="mb-4 shadow-sm ring-4 ring-primary/10" />
                  <h3 className="text-xl font-bold">Welcome to DURIA</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">Your personal companion, embedded directly into your workspace.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Paperclip size={16} className="text-primary"/> 1. Context is Key</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Use the paperclip icon below to attach your exact Tasks, Notes, and Events to the conversation. DURIA uses this specific context to answer accurately without hallucinations.
                    </p>
                  </div>
                  <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><DuriaAvatar size={16} /> 2. Action Taker</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      DURIA has hands! Tell it to <strong>"Create a Note"</strong>, <strong>"Schedule a lunch event"</strong>, or <strong>"Mark this task as done"</strong>.
                    </p>
                  </div>
                  <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm md:col-span-2 text-center border-primary/20 bg-primary/5">
                    <h4 className="font-semibold text-sm flex items-center justify-center gap-2 mb-1">⚡ 3. Token Limits</h4>
                    <p className="text-xs text-muted-foreground">
                      To keep DURIA fast and free, you are limited to <strong>150 queries per day</strong>. Clear your context after a question to save tokens!
                    </p>
                  </div>
                </div>
             </div>
          )}
          
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
              <span className="text-sm font-medium">
                {error?.message?.includes("429") 
                  ? "You have reached your daily limit of 150 AI queries. Please try again tomorrow!" 
                  : error.message || "An error occurred while contacting DURIA."}
              </span>
            </div>
          )}
          
          {messages.map((msg: any, i: number) => {
            const textContent = getMessageText(msg);
            const proposalToolCalls = getProposalToolCalls(msg);

            return (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'user' ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                  <User size={16} />
                </div>
              ) : (
                <DuriaAvatar size={32} />
              )}
              <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 rounded-tl-sm shadow-sm'}`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{textContent}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {textContent && (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:border prose-pre:border-border/50">
                        <ReactMarkdown>{textContent}</ReactMarkdown>
                      </div>
                    )}
                    {proposalToolCalls.map((toolInvocation: any) => {
                      const toolCallId = toolInvocation.toolCallId;
                      const toolName = toolInvocation.toolName;
                      
                      if (toolName.startsWith('propose')) {
                        const status = proposalStatus[toolCallId] || 'pending';
                        return (
                          <div key={toolCallId} className="mt-2 w-full max-w-sm">
                            <ProposalCard 
                              toolName={toolName}
                              args={toolInvocation.args}
                              status={status}
                              onConfirm={(payload, resultMsg) => {
                                setProposalStatus(prev => ({ ...prev, [toolCallId]: 'confirmed' }));
                                // @ts-ignore
                                sendMessage({ role: 'user', content: `[SYSTEM] Result: ${resultMsg}` });
                              }}
                              onCancel={() => {
                                setProposalStatus(prev => ({ ...prev, [toolCallId]: 'cancelled' }));
                              }}
                            />
                          </div>
                        );
                      }

                      if (toolInvocation.result !== undefined) {
                        return (
                          <div key={toolCallId} className="bg-primary/10 border border-primary/20 text-primary rounded-md p-2 text-xs flex items-center gap-2 mt-2">
                            <span className="font-semibold">✅ Executed: {toolInvocation.toolName}</span>
                            <span className="opacity-80 truncate">- {toolInvocation.result}</span>
                          </div>
                        );
                      } else {
                        return (
                          <div key={toolCallId} className="bg-secondary border border-border/50 text-secondary-foreground rounded-md p-2 text-xs flex items-center gap-2 mt-2 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="font-semibold">Executing {toolInvocation.toolName}...</span>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          );
          })}

          {/* Thinking Animation */}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <DuriaAvatar size={32} />
              <div className="px-4 py-3 rounded-2xl max-w-[85%] bg-card border border-border/50 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && totalContextItems > 0 && !hasAskedToClear && (
            <div className="flex justify-center px-4 pt-4 pb-2">
              <div className="bg-card border border-border/50 rounded-xl p-4 flex flex-col items-center text-center gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm text-muted-foreground font-medium">Would you like to keep the attached context for your next question?</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setHasAskedToClear(true)}>
                    Keep Data Attached
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => { clearContext(); setHasAskedToClear(true); }}>
                    Clear Data (Saves Tokens)
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Context Badge Area */}
      {totalContextItems > 0 && (
        <div className="px-4 py-2 bg-card border-t border-border/50 flex flex-col gap-2 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>📎 Attached Context (Will be sent with next message)</span>
            <button onClick={clearContext} className="hover:text-destructive">Clear All</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiPayload.todos.map((t, i) => (
               <ContextBadge key={`todo-${i}`} label={`Task: ${t.title}`} onRemove={() => removeContextItem('todos', i)} />
            ))}
            {aiPayload.notes.map((n, i) => (
               <ContextBadge key={`note-${i}`} label={`Note: ${n.heading}`} onRemove={() => removeContextItem('notes', i)} />
            ))}
            {aiPayload.events.map((e, i) => (
               <ContextBadge key={`event-${i}`} label={`Event: ${e.title}`} onRemove={() => removeContextItem('events', i)} />
            ))}
            {aiPayload.docs.map((d, i) => (
               <ContextBadge key={`doc-${i}`} label={`Manual: ${d.title}`} onRemove={() => removeContextItem('docs', i)} />
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border/50 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              size="icon" 
              className="shrink-0 rounded-xl"
              onClick={() => setIsAttachOpen(true)}
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MESSAGE_LIMIT}
              placeholder="Ask DURIA anything..."
              className="rounded-xl bg-secondary/50 border-border/50 focus-visible:ring-primary/20"
            />
            <Button type="submit" disabled={isLoading || !trimmedInput || isMessageTooLong} size="icon" className="shrink-0 rounded-xl">
              <Send className="w-5 h-5" />
            </Button>
          </div>
          {shouldShowCharacterCount && (
            <div className={`self-end text-xs font-medium ${trimmedInputLength >= MESSAGE_LIMIT ? 'text-destructive' : 'text-muted-foreground'}`}>
              {trimmedInputLength}/{MESSAGE_LIMIT}
            </div>
          )}
        </form>
      </div>

      <ContextAttachDialog open={isAttachOpen} onOpenChange={setIsAttachOpen} />
    </div>
  );
}

function ContextBadge({ label, onRemove }: { label: string, onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 bg-secondary/50 text-secondary-foreground text-xs px-2 py-1 rounded-md border border-border/50 max-w-[200px]">
      <span className="truncate flex-1">{label}</span>
      <button type="button" onClick={onRemove} className="hover:text-destructive shrink-0">
        <X size={12} />
      </button>
    </div>
  );
}

function AIUsageIndicator({
  usage,
  isLoading,
}: {
  usage: { used: number; limit: number } | null;
  isLoading: boolean;
}) {
  if (isLoading || !usage) {
    return <Skeleton className="h-6 w-28 rounded-full" />;
  }

  const percentage = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;
  const toneClass = percentage > 95
    ? 'text-destructive border-destructive/30 bg-destructive/10'
    : percentage >= 80
      ? 'text-amber-500 border-amber-500/30 bg-amber-500/10'
      : 'text-muted-foreground border-border/50 bg-secondary/40';
  const progressClass = percentage > 95
    ? 'bg-destructive'
    : percentage >= 80
      ? 'bg-amber-500'
      : 'bg-primary';

  return (
    <div className={`flex items-center gap-2 rounded-full border px-2.5 py-1 ${toneClass}`}>
      <span className="text-xs font-medium whitespace-nowrap">
        {usage.used} / {usage.limit} queries
      </span>
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-background/60">
        <div
          className={`h-full rounded-full transition-all ${progressClass}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
