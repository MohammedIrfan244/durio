"use client";

import { Card, CardContent } from '@/components/ui/card';
import { FileText, Archive, Search, PenTool } from 'lucide-react';

type NoNotesVariant = 'default' | 'archive' | 'search';

interface NoNotesProps {
  variant?: NoNotesVariant;
}

export function NoNotes({ variant = 'default' }: NoNotesProps) {
  const messages = {
    default: {
      emoji: '📝',
      title: 'Blank Canvas',
      message: 'Capture your ideas, lists, and dreams here. The page is yours!',
      icon: PenTool,
    },
    archive: {
      emoji: '📦',
      title: 'No Archives',
      message: 'Your archive is empty. Keep things tidy by archiving notes you\'re done with!',
      icon: Archive,
    },
    search: {
      emoji: '🔍',
      title: 'No Matches',
      message: 'We couldn\'t find any notes matching your search. Try different keywords.',
      icon: Search,
    },
  };

  const config = messages[variant];
  const Icon = config.icon;

  return (
    <Card className="bg-muted/20 border-dashed border-2 mt-2 w-full">
      <CardContent className="p-12 text-center space-y-4">
        <div className="text-5xl animate-in zoom-in duration-500">{config.emoji}</div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {config.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {config.message}
          </p>
        </div>

        <Icon className="w-8 h-8 mx-auto text-muted-foreground/30" />
      </CardContent>
    </Card>
  );
}
