"use client";

import React, { useState } from 'react';
import { useDuria } from '@/components/providers/duria-provider';
import { Paperclip, Send, Bot, User, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ContextAttachDialog from './context-attach-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DuriaChat() {
  const { aiPayload, removeContextItem } = useDuria();
  const [message, setMessage] = useState('');
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'duria', content: string}[]>([
    { role: 'duria', content: "Hello! I am DURIA. How can I help you manage your day?" }
  ]);

  const totalContextItems = aiPayload.todos.length + aiPayload.notes.length + aiPayload.events.length + aiPayload.docs.length;

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Optimistic UI for Phase 3 (We aren't hooking up the real AI yet)
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'duria', content: "I am in Phase 3 mode! I received your message, and I can see your attached context. In Phase 4, I will actually process this using Gemini." }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-secondary/10">
      {/* Header */}
      <div className="h-14 border-b border-border/50 bg-card flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">DURIA Assistant</h2>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 rounded-tl-sm'}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Context Badge Area */}
      {totalContextItems > 0 && (
        <div className="px-4 py-2 bg-card border-t border-border/50 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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
      )}

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border/50 shrink-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0 rounded-xl"
            onClick={() => setIsAttachOpen(true)}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Input 
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask DURIA anything..."
            className="rounded-xl bg-secondary/50 border-border/50 focus-visible:ring-primary/20"
          />
          <Button onClick={handleSend} size="icon" className="shrink-0 rounded-xl">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ContextAttachDialog open={isAttachOpen} onOpenChange={setIsAttachOpen} />
    </div>
  );
}

function ContextBadge({ label, onRemove }: { label: string, onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 bg-secondary/50 text-secondary-foreground text-xs px-2 py-1 rounded-md border border-border/50 max-w-[200px]">
      <span className="truncate flex-1">{label}</span>
      <button onClick={onRemove} className="hover:text-destructive shrink-0">
        <X size={12} />
      </button>
    </div>
  );
}
