"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ShowcaseSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [300, -200]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  return (
    <section ref={containerRef} className="py-40 bg-[#0A0A0A] relative overflow-hidden min-h-[120vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#ff6a00]/5 to-[#0A0A0A] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 w-full">
        {/* Quirky floating texts */}
        <motion.div style={{ y: y1 }} className="absolute -left-10 top-0 text-[#ff6a00]/20 font-[family-name:var(--font-heading)] text-5xl font-bold -rotate-12 pointer-events-none whitespace-nowrap">
          So much room for activities!
        </motion.div>
        
        <motion.div style={{ y: y2 }} className="absolute right-0 top-[20%] text-white/10 font-[family-name:var(--font-heading)] text-4xl font-bold rotate-6 pointer-events-none whitespace-nowrap">
          Wait, what day is it?
        </motion.div>
        
        <motion.div style={{ y: y3 }} className="absolute left-[10%] bottom-[10%] text-white/10 font-[family-name:var(--font-heading)] text-6xl font-black -rotate-3 pointer-events-none whitespace-nowrap">
          Oh right. Here.
        </motion.div>
        
        <div className="relative h-[800px] w-full max-w-6xl mx-auto perspective-[2000px]">
          
          {/* Back pane (Calendar) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" }}
            style={{ y: y1, rotateZ: rotate1, rotateX: 10, rotateY: -10 }}
            className="absolute top-10 right-[10%] w-[500px] h-[350px] bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-sm shadow-2xl p-8 z-10 flex flex-col gap-4 cursor-pointer"
          >
            <div className="flex justify-between items-center opacity-50">
               <div className="w-24 h-6 bg-yellow-500/20 rounded-full" />
               <div className="w-8 h-8 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2 opacity-30">
               {Array.from({ length: 35 }).map((_, i) => (
                 <div key={i} className={`rounded-md ${i === 12 || i === 18 ? 'bg-[#ff6a00]' : 'bg-white/10'}`} />
               ))}
            </div>
          </motion.div>

          {/* Middle pane (Notes / To-Do) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", delay: 0.1 }}
            style={{ y: y2, z: 100 }}
            className="absolute top-[30%] left-[5%] w-[450px] h-[400px] bg-white/10 border border-white/20 rounded-[40px] backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-8 z-20 flex flex-col gap-6 rotate-3 cursor-pointer"
          >
            <div className="w-32 h-8 bg-blue-500/20 rounded-full text-blue-300 font-bold px-4 flex items-center text-sm font-[family-name:var(--font-heading)]">
              Brain Dump
            </div>
            <div className="space-y-4 flex-1 opacity-80">
               <div className="flex items-center gap-4">
                 <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                 <div className="flex-1 h-4 bg-white/20 rounded-full" />
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-6 h-6 rounded-full bg-[#ff6a00]/80 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                 </div>
                 <div className="flex-1 h-4 bg-white/40 rounded-full line-through" />
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-6 h-6 rounded-full border-2 border-white/30" />
                 <div className="w-2/3 h-4 bg-white/20 rounded-full" />
               </div>
            </div>
          </motion.div>

          {/* Front pane (Calculator / Duria) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1.1 }}
            viewport={{ once: false }}
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", delay: 0.2 }}
            style={{ y: y3 }}
            className="absolute bottom-0 right-[15%] w-[400px] h-[300px] bg-black/60 border border-[#ff6a00]/30 rounded-[40px] backdrop-blur-2xl shadow-[0_50px_100px_rgba(255,106,0,0.2)] p-8 z-30 -rotate-6 flex flex-col cursor-pointer"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff6a00] to-amber-500 flex items-center justify-center text-3xl shadow-lg border-2 border-white/20">
                 ✨
               </div>
               <div className="text-2xl font-[family-name:var(--font-heading)] text-white font-bold">
                 Math? Handled.
               </div>
               <div className="text-white/50 font-[family-name:var(--font-body)]">
                 I'll crunch the numbers. You relax.
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
