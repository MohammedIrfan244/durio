import React from 'react';
import { motion } from 'framer-motion';
import BlockCard from './block-card';
import type { RoutineBlock } from '@prisma/client';

interface TimelineGridProps {
  blocks: RoutineBlock[];
  onEdit: (block: RoutineBlock) => void;
}

export default function TimelineGrid({ blocks, onEdit }: TimelineGridProps) {
  return (
    <div className="relative pt-4 pl-2">
      {/* Animated Vertical Timeline Line */}
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute left-[36px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full z-0 origin-top" 
      />
      
      <div className="space-y-6 relative z-10">
        {blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1, 
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
