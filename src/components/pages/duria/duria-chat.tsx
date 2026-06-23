"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDuria } from '@/components/providers/duria-provider';
import { Paperclip, Send, Bot, User, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ContextAttachDialog from './context-attach-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';

export default function DuriaChat() {
  const { aiPayload, removeContextItem, clearContext } = useDuria();
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalContextItems = aiPayload.todos.length + aiPayload.notes.length + aiPayload.events.length + aiPayload.docs.length;

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      contextPayload: aiPayload
    },
    onFinish: () => {
      // Auto-clear context after successful message transmission if desired. 
      // For now, we leave it attached until user clears it or asks a new topic.
    }
  });

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-secondary/10">
      {/* Header */}
      <div className="h-14 border-b border-border/50 bg-card flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">DURIA Assistant</h2>
        </div>
        {messages.length > 0 && (
           <span className="text-xs text-muted-foreground">AI Stream Active</span>
        )}
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
             <div className="text-center mt-20 text-muted-foreground animate-in fade-in">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Hello! I am DURIA. How can I help you manage your day?</p>
             </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 rounded-tl-sm shadow-sm'}`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:border prose-pre:border-border/50">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-secondary text-foreground">
                 <Loader2 className="w-4 h-4 animate-spin" />
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
               <ContextBadge key={`todo-${i}`} label={`Task: ${t.heading}`} onRemove={() => removeContextItem('todos', i)} />
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
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
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
            onChange={handleInputChange}
            placeholder="Ask DURIA anything..."
            className="rounded-xl bg-secondary/50 border-border/50 focus-visible:ring-primary/20"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="shrink-0 rounded-xl">
            <Send className="w-5 h-5" />
          </Button>
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
