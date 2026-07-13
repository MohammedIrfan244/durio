"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import images from "@/assets/images.json";
import { RotateCcwSquareIcon } from "lucide-react";

export function MeetDuriaSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [25, -25]);

  // Geometric shapes parallax
  const geoY1 = useTransform(scrollYProgress, [0, 1], [-150, 200]);
  const geoY2 = useTransform(scrollYProgress, [0, 1], [250, -300]);
  const geoY3 = useTransform(scrollYProgress, [0, 1], [100, -150]);
  const geoR1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const geoR2 = useTransform(scrollYProgress, [0, 1], [180, 0]);

  return (
    <section ref={containerRef} className="py-24 sm:py-40 bg-[#0A0A0A] overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff6a00]/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Hollow Geometric Shapes */}
      <motion.div style={{ y: geoY1 }} className="absolute top-[15%] left-[10%] w-16 h-16 rounded-full border border-white/20 z-0 pointer-events-none" />
      <motion.div style={{ y: geoY3, rotate: geoR1 }} className="absolute bottom-[25%] left-[15%] w-14 h-14 border border-[#ff6a00]/30 z-0 pointer-events-none" />
      <motion.svg style={{ y: geoY2, rotate: geoR2 }} className="absolute top-[25%] right-[15%] w-16 h-16 text-blue-400/20 z-0 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <polygon points="12 2 22 20 2 20" />
      </motion.svg>
      <motion.svg style={{ y: geoY1, rotate: geoR1 }} className="absolute top-[65%] right-[10%] w-24 h-12 text-[#ff6a00]/30 z-0 pointer-events-none" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M 0 25 Q 12.5 0, 25 25 T 50 25 T 75 25 T 100 25" />
      </motion.svg>
      <motion.svg style={{ y: geoY3, rotate: geoR2 }} className="absolute bottom-[10%] right-[30%] w-12 h-12 text-white/10 z-0 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <polygon points="12 2 22 20 2 20" />
      </motion.svg>

      {/* Extra Noodles */}
      <motion.svg style={{ y: geoY2, rotate: geoR1 }} className="absolute top-[10%] left-[40%] w-32 h-16 text-pink-400/20 z-0 pointer-events-none" viewBox="0 0 150 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M 0 25 C 25 -25, 50 75, 75 25 S 125 75, 150 25" />
      </motion.svg>
      <motion.svg style={{ y: geoY3, rotate: geoR2 }} className="absolute top-[40%] right-[30%] w-24 h-24 text-teal-400/20 z-0 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M 10 50 C 40 10, 80 10, 60 50 C 40 90, 80 90, 90 50" />
      </motion.svg>
      <motion.svg style={{ y: geoY1, rotate: geoR1 }} className="absolute bottom-[40%] left-[5%] w-24 h-12 text-yellow-400/20 z-0 pointer-events-none" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 5 25 L 20 5 L 40 45 L 60 5 L 80 45 L 95 25" />
      </motion.svg>
      <motion.svg style={{ y: geoY2, rotate: geoR2 }} className="absolute bottom-[15%] right-[5%] w-12 h-32 text-[#ff6a00]/20 z-0 pointer-events-none" viewBox="0 0 50 150" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M 25 10 Q 0 42.5, 25 75 T 25 140" />
      </motion.svg>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
        
        <div className="text-center mb-24 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            className="text-5xl sm:text-6xl md:text-8xl font-black font-[family-name:var(--font-heading)] text-white flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4"
          >
            <span>Meet</span>
            <span className="text-7xl sm:text-8xl md:text-9xl text-[#ff6a00] bubbly-text inline-flex font-[family-name:var(--font-bubbly)] tracking-tight pt-2">
              {"Duria.".split("").map((char, index) => (
                <span
                  key={index}
                  className="letter-bubble inline-block"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-5xl font-[family-name:var(--font-body)] text-[#ff6a00] mt-4 -rotate-2"
          >
            This is Duria. She's been listening.
          </motion.h3>
        </div>

        <div className="relative min-h-[480px] sm:min-h-[560px] md:min-h-[650px] flex items-center justify-center">
          
          {/* Duria Image (Center, tilted) */}
<motion.div 
  initial={{ opacity: 0, scale: 0.8 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: false }}
  style={{ y: y1, rotate: rotate1 }}
  className="absolute z-10 w-[240px] sm:w-[320px] md:w-[400px] aspect-square rounded-[32px] sm:rounded-[40px] overflow-hidden border-[6px] sm:border-[8px] border-white/10 shadow-[0_0_80px_rgba(255,106,0,0.4)]"
>
   <img 
      src={images.duria} 
      alt="Duria Character" 
      className="w-full h-full object-cover"
   />
</motion.div>

          {/* Chat Bubbles Overlapping */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" }}
            style={{ y: y2 }}
            className="absolute z-20 top-4 sm:top-10 left-2 right-2 sm:left-4 sm:w-[85%] md:-left-10 md:w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl rounded-tr-sm p-4 sm:p-6 shadow-2xl rotate-3 cursor-pointer"
          >
             <div className="text-white font-[family-name:var(--font-body)] text-lg">
               I feel so overwhelmed today. Too many tasks.
             </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", delay: 0.1 }}
            style={{ y: y1 }}
            className="absolute z-30 bottom-4 sm:bottom-10 left-2 right-2 sm:right-4 sm:w-[90%] md:-right-10 md:w-[450px] bg-[#ff6a00]/90 backdrop-blur-xl border border-[#ff6a00] rounded-3xl rounded-tl-sm p-4 sm:p-6 shadow-2xl -rotate-2 cursor-pointer"
          >
             <div className="flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                 <img src={images.duria} alt="Duria Avatar" className="w-full h-full object-cover" />
               </div>
               <div className="text-white font-[family-name:var(--font-body)] text-lg leading-relaxed">
                 Got you. No worries, let's figure it out together. I've rearranged your calendar so you can focus on just the top 2 things today. Need a hand with the first one?
               </div>
             </div>
          </motion.div>
          
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 1 }}
          className="text-center mt-12 text-white/50 font-[family-name:var(--font-body)] text-xl italic"
        >
          She's not just smart. She's on your side.
        </motion.div>
      </div>
    </section>
  );
}
