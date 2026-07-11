"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 200]);
  const rotate1 = useTransform(scrollY, [0, 1000], [0, 45]);
  const rotate2 = useTransform(scrollY, [0, 1000], [0, -30]);

  // Mouse tracking for the monitor skeleton
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  const rotateX = useTransform(smoothMouseY, [-500, 500], [15, -15]);
  const rotateY = useTransform(smoothMouseX, [-500, 500], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 overflow-hidden bg-[#0A0A0A] perspective-[1000px]"
    >
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

      <div className="z-10 w-full max-w-7xl px-6 flex flex-col items-start relative pointer-events-none">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 }
            }
          }}
          className="space-y-8 max-w-2xl relative z-30 pointer-events-auto"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" } } }}>
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 font-[family-name:var(--font-body)] text-sm -rotate-2 mb-4 hover:rotate-2 transition-transform cursor-pointer">
              Adulting is hard.
            </div>
          </motion.div>
          
          <motion.h1 
            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.5 } } }}
            className="flex flex-col gap-2 font-[family-name:var(--font-heading)] leading-[0.9] text-white drop-shadow-lg tracking-tighter"
          >
            <span className="text-4xl md:text-5xl font-bold -rotate-1">Need a</span>
            <div className="flex items-center gap-4 rotate-1">
              <span className="text-2xl md:text-3xl font-medium opacity-60">second</span>
              <span className="text-6xl md:text-8xl font-black text-[#ff6a00]">brain?</span>
            </div>
            <span className="text-3xl md:text-5xl font-extrabold mt-4 -rotate-2 opacity-90">I got your back.</span>
          </motion.h1>

          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" } } }}
            className="text-lg md:text-xl font-[family-name:var(--font-body)] text-white/70 mt-8 max-w-lg leading-relaxed font-medium"
          >
            Your friendly daily companion. Got you. No corporate jargon. Just a cozy place to keep your life together.
          </motion.p>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring" } } }}
            className="flex flex-col sm:flex-row items-start gap-6 pt-8"
          >
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                <Button size="lg" className="bg-white text-[#ff6a00] hover:bg-orange-50 font-[family-name:var(--font-heading)] font-bold text-2xl rounded-[2rem] px-12 py-10 shadow-2xl transition-all border-b-8 border-orange-200">
                  Open DURIO
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Asymmetrical Custom Interface Visual with Mouse Tracking */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, type: "spring" }}
          style={{ y: y1, rotateX, rotateY }}
          className="absolute right-0 top-10 w-[800px] h-[500px] hidden lg:block pointer-events-none"
        >
          <motion.div 
            animate={{ y: [-10, 20, -10], rotateZ: [2, -2, 2] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="w-full h-full rounded-[40px] border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_30px_100px_rgba(255,106,0,0.15)] p-6 relative preserve-3d"
          >
            {/* Chaotic UI blocks */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5 }}
              style={{ transform: "translateZ(50px)" }}
              className="absolute -top-10 -left-10 w-48 h-48 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg p-4 -rotate-6 shadow-2xl"
            >
               <div className="w-10 h-10 bg-[#ff6a00] rounded-full mb-4" />
               <div className="h-4 w-full bg-white/10 rounded-full mb-2" />
               <div className="h-4 w-2/3 bg-white/10 rounded-full" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }}
              style={{ transform: "translateZ(80px)" }}
              className="absolute bottom-10 -right-12 w-64 h-32 bg-gradient-to-br from-[#ff6a00]/30 to-amber-500/10 border border-[#ff6a00]/30 rounded-3xl backdrop-blur-xl p-4 rotate-12 flex items-center justify-center shadow-2xl"
            >
              <span className="text-white/60 font-[family-name:var(--font-heading)] text-2xl font-bold">Need a hand?</span>
            </motion.div>

            {/* Main Center UI Block */}
            <div className="w-full h-full border border-white/10 rounded-3xl bg-white/5 p-6 flex gap-6 overflow-hidden" style={{ transform: "translateZ(20px)" }}>
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
