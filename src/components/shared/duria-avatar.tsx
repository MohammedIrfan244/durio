import React from 'react';
import Image from 'next/image';
import images from '@/assets/images.json';
import { cn } from '@/lib/utils';

interface DuriaAvatarProps {
  size?: number;
  className?: string;
}

export function DuriaAvatar({ size = 24, className }: DuriaAvatarProps) {
  return (
    <div 
      className={cn("relative rounded-full overflow-hidden shrink-0", className)} 
      style={{ width: size, height: size }}
    >
      <Image 
        src={images.duria} 
        alt="Duria" 
        fill 
        className="object-cover" 
        sizes={`${size}px`}
      />
    </div>
  );
}
