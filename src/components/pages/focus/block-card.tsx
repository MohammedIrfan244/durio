import React from 'react';
import { Edit3, Flame, Coffee, Zap, BatteryCharging, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlockCardProps {
  block: any; // Replace 'any' with the actual type of your block object
  onEdit: () => void;
}

const ENERGY_STYLES: Record<string, { bg: string, border: string, text: string, icon: React.ReactNode }> = {
  HIGH: {
    bg: 'bg-orange-500/10 hover:bg-orange-500/15',
    border: 'border-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400',
    icon: <Flame size={16} />
  },
  MEDIUM: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    icon: <Zap size={16} />
  },
  LOW: {
    bg: 'bg-teal-500/10 hover:bg-teal-500/15',
    border: 'border-teal-500/30',
    text: 'text-teal-600 dark:text-teal-400',
    icon: <BatteryCharging size={16} />
  },
  RECOVERY: {
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
    border: 'border-indigo-500/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    icon: <Coffee size={16} />
  }
};

export default function BlockCard({ block, onEdit }: BlockCardProps) {
  const style = ENERGY_STYLES[block.energyLevel] || ENERGY_STYLES.MEDIUM;

  return (
    <div className="flex items-start gap-6 group">
      {/* Time Dot & Display */}
      <div className="flex flex-col items-center mt-1 min-w-[70px]">
        <div className={`w-3 h-3 rounded-full mb-1 shadow-[0_0_10px_rgba(0,0,0,0.1)] ${style.border.replace('border-', 'bg-').split('/')[0]}`} />
        <span className="text-xs font-semibold text-foreground tracking-tight">{block.startTime}</span>
        <span className="text-[10px] text-muted-foreground">{block.endTime}</span>
      </div>

      {/* Main Card */}
      <div 
        className={`flex-1 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${style.bg} ${style.border} group-hover:shadow-lg group-hover:-translate-y-0.5 relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-30" />
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
             <div className={`p-1.5 rounded-md bg-background/50 backdrop-blur-sm ${style.text} shadow-sm border border-current/10`}>
               {style.icon}
             </div>
             <div>
               <h3 className="font-semibold text-foreground text-lg leading-tight">{block.title}</h3>
               {block.priority === 'HIGH' && (
                 <span className="inline-flex items-center text-[10px] uppercase font-bold text-red-500 mt-1">
                   <AlertCircle size={10} className="mr-1" /> High Priority
                 </span>
               )}
             </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onEdit}
            className="opacity-100 transition-opacity h-8 w-8 hover:bg-background/50 rounded-full"
          >
            <Edit3 size={16} className="text-muted-foreground" />
          </Button>
        </div>

        {block.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{block.description}</p>
        )}

        {block.transitionRitual && (
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2">
             <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Ritual</span>
             <p className="text-xs text-foreground/80 italic">{block.transitionRitual}</p>
          </div>
        )}
      </div>
    </div>
  );
}
