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
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-24 sm:py-32 overflow-hidden bg-[#0A0A0A] perspective-[1000px]"
    >
      {/* Chaotic background glows */}
      <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-1/4 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] bg-[#ff6a00]/20 rounded-full blur-[100px] sm:blur-[150px] mix-blend-screen" />
      <motion.div style={{ y: y2 }} className="absolute bottom-1/4 -right-1/4 w-[320px] h-[320px] sm:w-[650px] sm:h-[650px] lg:w-[800px] lg:h-[800px] bg-pink-500/10 rounded-full blur-[100px] sm:blur-[150px] mix-blend-screen" />
      
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
      <motion.div 
        style={{ y: y1, rotate: rotate2 }} 
        className="absolute top-[60%] right-[25%] text-white/5 font-[family-name:var(--font-heading)] text-2xl font-bold select-none pointer-events-none"
      >
        I'll remember so you don't have to.
      </motion.div>

      <div className="z-10 w-full max-w-7xl px-0 sm:px-2 flex flex-col items-center sm:items-start relative pointer-events-none">
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
            <span className="text-5xl sm:text-6xl md:text-7xl font-bold -rotate-1">Need a</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 rotate-1">
              <span className="text-3xl sm:text-4xl md:text-5xl font-medium opacity-60">second</span>
              <span className="text-6xl sm:text-7xl md:text-8xl font-black text-[#ff6a00]">brain?</span>
            </div>
            <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold mt-4 -rotate-2 opacity-90">I got your back.</span>
          </motion.h1>

          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring" } } }}
            className="text-base sm:text-lg md:text-xl font-[family-name:var(--font-body)] text-white/70 mt-8 max-w-lg leading-relaxed font-medium"
          >
            Your friendly daily companion. Got you. No corporate jargon. Just a cozy place to keep your life together.
          </motion.p>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring" } } }}
            className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pt-6 sm:pt-8"
          >
            <Link href="/dashboard">
              <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#ff6a00] hover:bg-orange-50 font-[family-name:var(--font-heading)] font-bold text-xl sm:text-2xl rounded-[2rem] px-8 sm:px-12 py-8 sm:py-10 shadow-2xl transition-all border-b-8 border-orange-200">
                  Let's start
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
              className="absolute -top-10 -left-10 w-48 h-48 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg p-5 -rotate-6 shadow-2xl flex flex-col justify-center"
            >
               <div className="w-12 h-12 bg-[#ff6a00] rounded-full mb-4 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(255,106,0,0.4)]">
                 ☕
               </div>
               <div className="text-white/80 font-bold text-sm mb-1">Fueling up...</div>
               <div className="h-2 w-full bg-white/10 rounded-full mb-2 overflow-hidden">
                 <div className="h-full w-2/3 bg-[#ff6a00] rounded-full" />
               </div>
               <div className="h-2 w-2/3 bg-white/10 rounded-full" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1 }}
              style={{ transform: "translateZ(80px)" }}
              className="absolute bottom-10 -right-12 w-64 h-32 bg-gradient-to-br from-[#ff6a00]/30 to-amber-500/10 border border-[#ff6a00]/30 rounded-3xl backdrop-blur-xl p-4 rotate-12 flex items-center justify-center shadow-2xl"
            >
              <span className="text-white/80 font-[family-name:var(--font-heading)] text-2xl font-bold flex items-center gap-2">
                Need a hand? <span className="text-3xl">🤘</span>
              </span>
            </motion.div>

            {/* Main Center UI Block */}
            <div className="w-full h-full border border-white/10 rounded-3xl bg-white/5 p-6 flex gap-6 overflow-hidden" style={{ transform: "translateZ(20px)" }}>
               <div className="w-48 shrink-0 flex flex-col gap-4">
                 <div className="h-12 w-full bg-white/10 rounded-2xl flex items-center px-4 gap-2">
                   <div className="w-4 h-4 rounded-full bg-[#ff6a00]/50" />
                   <div className="h-2 flex-1 bg-white/20 rounded-full" />
                 </div>
                 <div className="h-full w-full bg-white/5 rounded-2xl border border-white/10 p-4 space-y-4">
                   {[
                     { icon: "🚀", color: "text-[#ff6a00]" },
                     { icon: "📝", color: "text-blue-400" },
                     { icon: "📅", color: "text-pink-400" },
                     { icon: "✨", color: "text-yellow-400" },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-sm border border-white/5 shadow-sm">
                         {item.icon}
                       </div>
                       <div className="space-y-1.5 flex-1">
                         <div className={`h-2 w-${[3, 4, 2, 3][i]}/4 bg-white/20 rounded-full`} />
                         <div className={`h-2 w-${[1, 2, 1, 2][i]}/3 bg-white/10 rounded-full`} />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="flex-1 flex flex-col gap-4">
                 <div className="h-24 w-full bg-white/10 rounded-2xl flex items-center px-6 gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff6a00] to-pink-500 p-0.5">
                      <div className="w-full h-full bg-black/50 rounded-full flex items-center justify-center text-xl">
                        😎
                      </div>
                    </div>
                    <div className="space-y-2">
                       <div className="h-4 w-32 bg-white/30 rounded-full" />
                       <div className="h-3 w-48 bg-white/10 rounded-full" />
                    </div>
                 </div>
                 <div className="flex-1 bg-[#ff6a00]/10 border border-[#ff6a00]/20 rounded-2xl p-6 relative overflow-hidden flex flex-col gap-4">
                    <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-[#ff6a00]/20 rounded-full blur-2xl" />
                    
                    <div className="flex justify-between items-center z-10">
                      <div className="h-5 w-24 bg-white/30 rounded-full" />
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-xs">⋯</div>
                    </div>

                    {[1, 2].map((i) => (
                      <div key={i} className="w-full bg-black/20 rounded-xl border border-white/5 p-4 flex items-center gap-4 z-10 backdrop-blur-sm">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${i === 1 ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {i === 1 ? '✓' : '⚡'}
                        </div>
                        <div className="flex-1 space-y-2">
                           <div className="h-3 w-3/4 bg-white/40 rounded-full" />
                           <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
