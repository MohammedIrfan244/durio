"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Play } from "lucide-react";
import { useRef } from "react";
import images from "@/asset/images.json";

export function AndroidSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const smoothScrollY = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const y1 = useTransform(smoothScrollY, [0, 1], [200, -200]);
  const y2 = useTransform(smoothScrollY, [0, 1], [0, -300]);
  const y3 = useTransform(smoothScrollY, [0, 1], [300, -100]);
  
  // Floating decorative elements
  const floatY1 = useTransform(smoothScrollY, [0, 1], [100, -500]);
  const floatY2 = useTransform(smoothScrollY, [0, 1], [-200, 400]);

  return (
    <section id="android" ref={containerRef} className="py-40 bg-black overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff6a00]/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Decorative chaotic elements */}
      <motion.div style={{ y: floatY1 }} className="absolute top-[10%] right-[10%] text-[#ff6a00]/20 font-[family-name:var(--font-heading)] text-8xl font-black rotate-12 pointer-events-none blur-sm">
        Soon.
      </motion.div>
      <motion.div style={{ y: floatY2 }} className="absolute bottom-[20%] left-[5%] text-white/5 font-[family-name:var(--font-heading)] text-6xl font-bold -rotate-12 pointer-events-none">
        Everywhere.
      </motion.div>
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] left-[30%] w-64 h-64 border border-[#ff6a00]/20 rounded-full border-dashed opacity-50 pointer-events-none"
      />

      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Text and Badge */}
        <div className="flex-1 space-y-8 z-30">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-black font-[family-name:var(--font-heading)] text-white leading-none">
              Take me<br />
              with you.
            </h2>
            <p className="text-xl font-[family-name:var(--font-body)] text-muted-foreground mt-6 max-w-sm">
              Cross-platform companionship. I'll be in your pocket soon. 
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
            viewport={{ once: false }}
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", bounce: 0.6 }}
            className="inline-flex cursor-pointer"
          >
            {/* Readable Badge */}
            <div className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-3xl font-bold font-[family-name:var(--font-body)] text-lg shadow-[0_10px_40px_rgba(255,255,255,0.2)]">
              <Play className="w-6 h-6 fill-current" />
              <div>
                <div className="text-xs uppercase tracking-widest text-black/60">Coming Soon</div>
                <div>Google Play</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scattered Phones */}
        <div className="flex-1 relative h-[700px] w-full perspective-[2000px]">
           {/* Phone 1 */}
           <motion.div
             initial={{ opacity: 0, y: 100 }}
             whileInView={{ opacity: 1, y: 0 }}
             whileHover={{ scale: 1.05, rotateZ: -10, zIndex: 50 }}
             viewport={{ once: false }}
             transition={{ type: "spring", bounce: 0.4 }}
             style={{ y: y1, rotateZ: -15, rotateY: 15 }}
             className="absolute top-[10%] right-[40%] w-[290px] aspect-[9/19] rounded-[40px] border-[8px] border-white/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black z-10 cursor-pointer"
           >
             <img 
                src={images.mobile1}
                alt="Android App Screenshot"
                className="w-full h-full object-cover"
             />
           </motion.div>

           {/* Phone 2 */}
           <motion.div
             initial={{ opacity: 0, y: 150 }}
             whileInView={{ opacity: 1, y: 0 }}
             whileHover={{ scale: 1.08, rotateZ: 0, zIndex: 50 }}
             viewport={{ once: false }}
             transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
             style={{ y: y2, rotateZ: 5, rotateY: -10 }}
             className="absolute top-[20%] right-[10%] w-[320px] aspect-[9/19] rounded-[40px] border-[10px] border-[#ff6a00]/40 overflow-hidden shadow-[0_30px_80px_rgba(255,106,0,0.3)] bg-black z-20 cursor-pointer"
           >
             <img 
                src={images.mobile3}
                alt="Android App AI Chat"
                className="w-full h-full object-cover"
             />
           </motion.div>

           {/* Phone 3 */}
           <motion.div
             initial={{ opacity: 0, y: 100 }}
             whileInView={{ opacity: 1, y: 0 }}
             whileHover={{ scale: 1.05, rotateZ: 15, zIndex: 50 }}
             viewport={{ once: false }}
             transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
             style={{ y: y3, rotateZ: 25, rotateX: 10 }}
             className="absolute bottom-[10%] right-[30%] w-[260px] aspect-[9/19] rounded-[30px] border-[6px] border-white/10 overflow-hidden shadow-2xl bg-black z-30 cursor-pointer"
           >
             <img 
                src={images.mobile2}
                alt="Android App Calendar"
                className="w-full h-full object-cover"
             />
           </motion.div>
        </div>

      </div>
    </section>
  );
}
