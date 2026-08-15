"use client";

import { useEffect, useState } from "react";
import { getActiveGreeting } from "@/server/actions/greeting-actions";
import { Gift, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";

const FloatingCalculator = dynamic(
  () => import("@/components/shared/floating-calculator"),
  { ssr: false }
);

export default function GreetingWidget() {
  const [greeting, setGreeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await getActiveGreeting();
      if (res.success && res.data) {
        setGreeting(res.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return null;

  if (!greeting) {
    return <FloatingCalculator />;
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, y: 50 }}
        animate={{ 
          scale: 1, 
          y: [0, -8, 0],
        }}
        transition={{ 
          y: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 0.3
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: greeting.giftBoxColor || "hsl(var(--primary))",
        }}
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl text-white z-50 flex items-center justify-center border border-white/20"
      >
        <Gift size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                backgroundColor: greeting.bgColor || "hsl(var(--card))",
              }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col z-10"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="relative w-full aspect-video bg-zinc-900">
                <Image
                  src={greeting.imageUrl}
                  alt={greeting.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-8">
                <h3 
                  className="text-2xl font-bold mb-3 tracking-tight"
                  style={{ color: greeting.titleColor || "hsl(var(--foreground))" }}
                >
                  {greeting.title}
                </h3>
                <p 
                  className="text-base leading-relaxed"
                  style={{ color: greeting.descColor || "hsl(var(--muted-foreground))" }}
                >
                  {greeting.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
