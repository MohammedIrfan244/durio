import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Home } from 'lucide-react'

interface AllNoteHomeCardProps {
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
}

function AllNoteHomeCard({ selectedFolderId, onSelectFolder }: AllNoteHomeCardProps) {
  return (
    <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "nav-item-group relative flex min-w-[110px] cursor-pointer flex-col justify-center items-center rounded-xl border-2 p-3 transition-all duration-300 h-[100px] group",
              "border-dashed hover:border-primary",
              selectedFolderId === null 
                ? "border-primary bg-primary/5 ring-1 ring-primary/20 scale-95" 
                : "border-border/60 bg-card/50 hover:bg-card"
            )}
            onClick={() => onSelectFolder(null)}
          >
            {/* Decorative circles */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/30 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" 
                 style={{ animationDelay: '0.5s' }} 
            />
            
            {/* Home Icon */}
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 mb-2",
              "bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm",
              "group-hover:scale-110 group-hover:rotate-6"
            )}>
              <Home className={cn(
                "h-6 w-6 transition-all duration-300",
                selectedFolderId === null ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
            
            <span className={cn(
              "font-bold text-sm transition-all duration-300",
              selectedFolderId === null ? "text-primary" : "text-foreground/80 group-hover:text-primary"
            )}>
              All Notes
            </span>
            
            {/* Animated underline when selected */}
            {selectedFolderId === null && (
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"
              />
            )}

            {/* Hover glow effect */}
            <div 
              className={cn(
                "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none blur-xl -z-10",
                "group-hover:opacity-100"
              )}
              style={{
                background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.3), transparent 70%)'
              }}
            />
          </motion.div>
  )
}

export default AllNoteHomeCard