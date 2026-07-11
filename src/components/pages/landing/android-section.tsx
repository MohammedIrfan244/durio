"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import { useRef } from "react";

export function AndroidSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y3 = useTransform(scrollYProgress, [0, 1], [300, -100]);

  return (
    <section id="android" ref={containerRef} className="py-40 bg-black overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff6a00]/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
        
        {/* Text and Badge */}
        <div className="flex-1 space-y-8 z-30">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
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
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="inline-flex"
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
             style={{ y: y1, rotateZ: -15, rotateY: 15 }}
             className="absolute top-[10%] right-[40%] w-[250px] aspect-[9/19] rounded-[40px] border-[8px] border-white/20 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black z-10"
           >
             <img 
                src="https://res.cloudinary.com/doseusf1y/image/upload/v1783784421/Screenshot_2026-07-11_210941_mgxk58.png"
                alt="Android App Screenshot"
                className="w-full h-full object-cover"
             />
           </motion.div>

           {/* Phone 2 */}
           <motion.div
             style={{ y: y2, rotateZ: 5, rotateY: -10 }}
             className="absolute top-[20%] right-[10%] w-[280px] aspect-[9/19] rounded-[40px] border-[10px] border-[#ff6a00]/40 overflow-hidden shadow-[0_30px_80px_rgba(255,106,0,0.3)] bg-black z-20"
           >
             <img 
                src="https://res.cloudinary.com/doseusf1y/image/upload/v1783784535/ChatGPT_Image_Jul_11_2026_09_11_44_PM_o22mvb.png"
                alt="Android App AI Chat"
                className="w-full h-full object-cover"
             />
           </motion.div>

           {/* Phone 3 */}
           <motion.div
             style={{ y: y3, rotateZ: 25, rotateX: 10 }}
             className="absolute bottom-[10%] right-[30%] w-[220px] aspect-[9/19] rounded-[30px] border-[6px] border-white/10 overflow-hidden shadow-2xl bg-black z-30"
           >
             <img 
                src="https://res.cloudinary.com/doseusf1y/image/upload/v1783784495/Screenshot_2026-07-11_211121_aypjns.png"
                alt="Android App Calendar"
                className="w-full h-full object-cover"
             />
           </motion.div>
        </div>

      </div>
    </section>
  );
}
