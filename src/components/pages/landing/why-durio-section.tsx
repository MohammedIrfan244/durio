"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { StickyNote, CalendarDays, CheckCircle, Calculator } from "lucide-react";
import { useRef } from "react";

export function WhyDurioSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Chaotic parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [300, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-300, 400]);
  const x1 = useTransform(scrollYProgress, [0, 1], [-300, 200]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-90, 90]);
  const scale1 = useTransform(scrollYProgress, [0, 1], [0.5, 1.5]);

  return (
    <section ref={containerRef} className="py-24 sm:py-40 bg-[#0A0A0A] relative overflow-hidden">
      
      {/* Background phrases */}
      <motion.div 
        style={{ x: y1 }} 
        initial={{ opacity: 0.2 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:block absolute top-20 right-10 text-white/10 font-[family-name:var(--font-heading)] text-7xl font-black whitespace-nowrap"
      >
        Too many tabs open.
      </motion.div>
      <motion.div 
        style={{ x: y2 }} 
        initial={{ opacity: 0.2 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="hidden lg:block absolute bottom-20 left-10 text-[#ff6a00]/10 font-[family-name:var(--font-heading)] text-8xl font-black whitespace-nowrap"
      >
        Where did I put that?
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring" }}
          className="space-y-8 flex-1"
        >
          <div className="inline-block px-6 py-3 rounded-2xl bg-[#ff6a00]/10 border border-[#ff6a00]/30 text-[#ff6a00] font-[family-name:var(--font-heading)] text-xl font-bold -rotate-3">
            Why DURIO?
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black font-[family-name:var(--font-heading)] text-white tracking-tighter leading-none">
            Your life isn't scattered.<br />
            <span className="text-muted-foreground italic text-3xl sm:text-4xl md:text-6xl">Your apps are.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-[family-name:var(--font-body)] text-muted-foreground max-w-lg leading-relaxed">
            You've got tasks in one place, notes in another, and calendar events somewhere else. 
            DURIO brings it all together so you can stop switching tabs and start chilling. Together.
          </p>
        </motion.div>

        <div className="flex-1 w-full relative h-[420px] sm:h-[520px] lg:h-[600px] max-w-[500px] lg:max-w-none">
          {/* Scattered Apps Parallaxing around */}
          <motion.div
            style={{ y: y1, rotate: rotate1 }}
            className="absolute top-[8%] right-[8%] sm:right-[20%] w-20 h-20 sm:w-24 sm:h-24 bg-pink-500/10 border border-pink-500/30 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <StickyNote className="w-10 h-10 text-pink-400" />
          </motion.div>

          <motion.div
            style={{ y: y2, x: x1 }}
            className="absolute bottom-[20%] left-[5%] sm:left-[10%] w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/10 border border-blue-500/30 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl"
          >
            <CheckCircle className="w-14 h-14 text-blue-400" />
          </motion.div>

          <motion.div
            style={{ y: y1, scale: scale1 }}
            className="absolute top-[40%] left-[2%] sm:left-[0%] w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl"
          >
            <CalendarDays className="w-8 h-8 text-yellow-400" />
          </motion.div>

          <motion.div
            style={{ y: x1, rotate: y1 }}
            className="absolute bottom-[38%] right-[2%] sm:right-[5%] w-20 h-20 sm:w-28 sm:h-28 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <Calculator className="w-12 h-12 text-indigo-400" />
          </motion.div>

          {/* Central Unified UI */}
          <motion.div
            style={{ y: y1 }}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.6 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[88%] sm:w-[80%] aspect-[4/3] bg-white/5 border border-white/10 rounded-[32px] sm:rounded-[40px] backdrop-blur-2xl shadow-[0_0_80px_rgba(255,106,0,0.15)] flex flex-col items-center justify-center overflow-hidden"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-[#ff6a00]/10 to-transparent" />
             <div className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-heading)] text-white font-black text-center z-10 px-4 sm:px-8">
                <span className="text-[#ff6a00]">One</span> place.<br/>
                All yours.
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
