"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 200]);
  const rotate1 = useTransform(scrollY, [0, 1000], [0, 45]);
  const rotate2 = useTransform(scrollY, [0, 1000], [0, -30]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 overflow-hidden bg-[#0A0A0A]">
      {/* Chaotic background glows */}
      <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#ff6a00]/20 rounded-full blur-[150px] mix-blend-screen" />
      <motion.div style={{ y: y2 }} className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-[150px] mix-blend-screen" />
      
      {/* Floating scattered text phrases */}
      <motion.div 
        style={{ y: y1, rotate: rotate1 }} 
        className="absolute top-[20%] right-[10%] text-white/10 font-[family-name:var(--font-heading)] text-3xl font-bold select-none pointer-events-none"
      >
        Let's figure it out.
      </motion.div>
      <motion.div 
        style={{ y: y2, rotate: rotate2 }} 
        className="absolute bottom-[30%] left-[5%] text-[#ff6a00]/10 font-[family-name:var(--font-heading)] text-4xl font-bold select-none pointer-events-none"
      >
        No worries.
      </motion.div>

      <div className="z-10 w-full max-w-7xl px-6 flex flex-col items-start relative">
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: -2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="space-y-8 max-w-2xl relative z-30"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 font-[family-name:var(--font-body)] text-sm -rotate-2 mb-4">
            Adulting is hard.
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-[family-name:var(--font-heading)] leading-[0.9] text-white drop-shadow-lg tracking-tighter">
            Need a<br />
            second brain?<br />
            <span className="text-[#ff6a00] inline-block mt-4 rotate-2">I got your back. 🍊</span>
          </h1>

          <p className="text-xl md:text-2xl font-[family-name:var(--font-body)] text-muted-foreground mt-8 max-w-lg leading-relaxed">
            Your friendly daily companion. Got you. No corporate jargon. Just a cozy place to keep your life together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start gap-6 pt-8">
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-[family-name:var(--font-body)] text-xl rounded-2xl px-10 py-8 shadow-[0_0_30px_rgba(255,106,0,0.4)] hover:shadow-[0_0_50px_rgba(255,106,0,0.6)] transition-all border-b-4 border-orange-700">
                  Open DURIO
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Floating Asymmetrical Custom Interface Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100, rotate: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0, rotate: 5 }}
          transition={{ duration: 1.2, delay: 0.2, type: "spring" }}
          style={{ y: y1 }}
          className="absolute right-0 top-10 w-[800px] h-[500px] hidden lg:block pointer-events-none"
        >
          <motion.div 
            animate={{ y: [-10, 20, -10], rotate: [5, 3, 5] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="w-full h-full rounded-[40px] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl p-6 relative"
          >
            {/* Chaotic UI blocks */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5 }}
              className="absolute -top-10 -left-10 w-48 h-48 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg p-4 -rotate-6"
            >
               <div className="w-10 h-10 bg-[#ff6a00] rounded-full mb-4" />
               <div className="h-4 w-full bg-white/10 rounded-full mb-2" />
               <div className="h-4 w-2/3 bg-white/10 rounded-full" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }}
              className="absolute bottom-10 -right-12 w-64 h-32 bg-gradient-to-br from-[#ff6a00]/30 to-amber-500/10 border border-[#ff6a00]/30 rounded-3xl backdrop-blur-xl p-4 rotate-12 flex items-center justify-center"
            >
              <span className="text-white/60 font-[family-name:var(--font-heading)] text-2xl font-bold">Need a hand?</span>
            </motion.div>

            {/* Main Center UI Block */}
            <div className="w-full h-full border border-white/10 rounded-3xl bg-white/5 p-6 flex gap-6 overflow-hidden">
               <div className="w-48 shrink-0 flex flex-col gap-4">
                 <div className="h-12 w-full bg-white/10 rounded-2xl" />
                 <div className="h-full w-full bg-white/5 rounded-2xl border border-white/10" />
               </div>
               <div className="flex-1 flex flex-col gap-4">
                 <div className="h-24 w-full bg-white/10 rounded-2xl" />
                 <div className="flex-1 bg-[#ff6a00]/10 border border-[#ff6a00]/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#ff6a00]/30 rounded-full blur-xl" />
                 </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
