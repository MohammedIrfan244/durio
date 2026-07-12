"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import images from "@/asset/images.json";
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

  return (
    <section ref={containerRef} className="py-24 sm:py-40 bg-[#0A0A0A] overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff6a00]/10 blur-[150px] rounded-full pointer-events-none" />

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
