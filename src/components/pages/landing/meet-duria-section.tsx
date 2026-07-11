"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function MeetDuriaSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [5, -5]);

  return (
    <section ref={containerRef} className="py-40 bg-[#0A0A0A] overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff6a00]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        <div className="text-center mb-24 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-black font-[family-name:var(--font-heading)] text-white"
          >
            Meet Duria.
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-[family-name:var(--font-body)] text-[#ff6a00] mt-4 -rotate-2"
          >
            She's got your back.
          </motion.h3>
        </div>

        <div className="relative h-[600px] flex items-center justify-center">
          
          {/* Duria Image (Center, tilted) */}
          <motion.div 
            style={{ y: y1, rotate: rotate1 }}
            className="absolute z-10 w-[300px] md:w-[400px] aspect-square rounded-[40px] overflow-hidden border-[8px] border-white/10 shadow-[0_0_80px_rgba(255,106,0,0.4)]"
          >
             <img 
                src="https://res.cloudinary.com/doseusf1y/image/upload/v1783762396/duria2_n5jccz.jpg" 
                alt="Duria Character" 
                className="w-full h-full object-cover"
             />
          </motion.div>

          {/* Chat Bubbles Overlapping */}
          <motion.div
            style={{ y: y2 }}
            className="absolute z-20 top-10 md:-left-10 left-4 w-[80%] md:w-[400px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl rounded-tr-sm p-6 shadow-2xl rotate-3"
          >
             <div className="text-white font-[family-name:var(--font-body)] text-lg">
               I feel so overwhelmed today. Too many tasks.
             </div>
          </motion.div>

          <motion.div
            style={{ y: y1 }}
            className="absolute z-30 bottom-10 md:-right-10 right-4 w-[90%] md:w-[450px] bg-[#ff6a00]/90 backdrop-blur-xl border border-[#ff6a00] rounded-3xl rounded-tl-sm p-6 shadow-2xl -rotate-2"
          >
             <div className="flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center font-bold font-[family-name:var(--font-heading)] text-[#ff6a00] text-xl">
                 D
               </div>
               <div className="text-white font-[family-name:var(--font-body)] text-lg leading-relaxed">
                 Got you. No worries, let's figure it out together. I've rearranged your calendar so you can focus on just the top 2 things today. Need a hand with the first one? 🍊
               </div>
             </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
