import React from 'react';
import { motion } from 'framer-motion';
import BlockCard from './block-card';

interface TimelineGridProps {
  blocks: any[];
  onEdit: (block: any) => void;
}

export default function TimelineGrid({ blocks, onEdit }: TimelineGridProps) {
  return (
    <div className="relative pt-4">
      {/* Vertical Timeline Line */}
      <div className="absolute left-[28px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-primary/50 via-border to-transparent rounded-full z-0" />
      
      <div className="space-y-6 relative z-10">
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.05, 
              type: "spring", 
              stiffness: 100 
            }}
          >
            <BlockCard block={block} onEdit={() => onEdit(block)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
