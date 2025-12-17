import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Coffee, Sparkles } from 'lucide-react';

export function NoTodos({ status }: { status: string }) {
  const messages = {
    TODO: {
      emoji: '🎯',
      title: 'All clear!',
      message: 'No tasks waiting for you right now. Time to add some goals or just enjoy the moment!',
      icon: Sparkles,
    },
    'IN PROGRESS': {
      emoji: '🚀',
      title: 'Ready when you are',
      message: 'Nothing in progress at the moment. Start something awesome when inspiration strikes!',
      icon: CheckCircle2,
    },
    COMPLETED: {
      emoji: '✨',
      title: 'Fresh start',
      message: 'No completed tasks yet, but every journey starts somewhere. You got this!',
      icon: CheckCircle2,
    },
    CANCELLED: {
      emoji: '🌱',
      title: 'Clean slate',
      message: 'Nothing cancelled here. Keeping things focused and positive!',
      icon: Coffee,
    },
  };

  const config = messages[status as keyof typeof messages] || messages.TODO;
  const Icon = config.icon;

  return (
    <Card className="bg-muted/20 border-dashed border-2 mt-2">
      <CardContent className="p-6 text-center space-y-3">
        <div className="text-4xl">{config.emoji}</div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {config.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {config.message}
          </p>
        </div>

        <Icon className="w-4 h-4 mx-auto text-muted-foreground opacity-50" />
      </CardContent>
    </Card>
  );
}