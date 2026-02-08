import { Card, CardContent } from '@/components/ui/card';

export function NoStats() {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="text-6xl animate-bounce">📊</div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">
              Nothing to see here... yet!
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Your stats are taking a little nap right now. Create some tasks, 
              check a few off, and watch this space come alive with all your 
              productivity wins! 🎉
            </p>
          </div>

          <div className="pt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <span>✨</span>
              <span>Complete tasks to build streaks</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🎯</span>
              <span>Track your productivity rhythm</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🚀</span>
              <span>Earn achievement badges</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground italic">
              Pro tip: Start small, stay consistent, and the stats will follow 💪
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}