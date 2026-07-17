"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TerminalSquare, Sparkles, CheckCircle2, Quote } from "lucide-react";

export function StorySection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Aggressive parallax transforms for the chaos
  const y1 = useTransform(scrollYProgress, [0, 1], [300, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-200, 400]);
  const x1 = useTransform(scrollYProgress, [0, 1], [-200, 200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [10, -30]);
  
  // Parallax for the main card itself
  const cardY = useTransform(scrollYProgress, [0, 1], [100, -50]);

  return (
    <section ref={containerRef} className="py-24 sm:py-40 bg-[#0A0A0A] relative z-20 overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff6a00]/10 blur-[150px] rounded-full pointer-events-none" />
      <motion.div 
        style={{ y: y1, x: x1 }}
        className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" 
      />

      {/* Aggressive Floating text chaos */}
      <motion.div 
        style={{ x: x1, y: y1, rotate: rotate1 }} 
        className="hidden lg:block absolute top-[15%] left-[5%] text-white/5 font-[family-name:var(--font-heading)] text-8xl font-black whitespace-nowrap pointer-events-none"
      >
        How did we get here?
      </motion.div>
      <motion.div 
        style={{ x: x2, y: y2, rotate: rotate2 }} 
        className="hidden lg:block absolute bottom-[20%] right-[2%] text-[#ff6a00]/5 font-[family-name:var(--font-heading)] text-7xl font-black whitespace-nowrap pointer-events-none"
      >
        Weekend project.
      </motion.div>

      {/* Floating UI Elements */}
      <motion.div
        style={{ y: y1, rotate: rotate1 }}
        className="absolute top-[30%] left-[10%] p-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl hidden md:flex items-center justify-center shadow-2xl z-10"
      >
        <Quote className="w-8 h-8 text-white/40" />
      </motion.div>
      <motion.div
        style={{ y: y2, rotate: rotate2 }}
        className="absolute bottom-[40%] right-[12%] p-4 bg-[#ff6a00]/10 border border-[#ff6a00]/30 backdrop-blur-xl rounded-3xl hidden md:flex items-center justify-center shadow-2xl z-10"
      >
        <CheckCircle2 className="w-10 h-10 text-[#ff6a00]" />
      </motion.div>

      <div className="container relative z-30 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-[#ff6a00] shadow-[0_0_30px_rgba(255,106,0,0.2)] backdrop-blur-md">
            <TerminalSquare size={32} />
          </div>
          
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-6 font-[family-name:var(--font-heading)] leading-none">
            So, how did we <br/><span className="text-[#ff6a00]">get here?</span>
          </h2>
          <p className="text-xl md:text-2xl text-white/40 italic mb-16 max-w-2xl font-[family-name:var(--font-body)]">
            "If you scrolled this far, maybe you want to hear how this all started out..."
          </p>
        </motion.div>

        <motion.div
          style={{ y: cardY }}
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="relative text-left space-y-8 text-base md:text-xl text-white/70 leading-relaxed bg-white/5 border border-white/10 p-8 md:p-14 rounded-[40px] backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.6)] font-[family-name:var(--font-body)]"
        >
          <div className="absolute -top-8 -left-8 text-[#ff6a00] opacity-40 drop-shadow-[0_0_20px_rgba(255,106,0,0.8)]">
            <Sparkles size={80} />
          </div>
          
          <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.2, duration: 0.5 }}>
            DURIO began as a simple, local to-do list I built just so I could manage my own work easily. Nothing crazy, just something quick that wouldn't get in my way. Then, I added a local notepad because keeping thoughts in the same place made sense.
          </motion.p>
          <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.4, duration: 0.5 }}>
            Before I knew it, the thought hit me: <strong className="text-white font-bold tracking-wide text-[110%]">Why not build a full application that handles all aspects of my life?</strong>
          </motion.p>
          <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.6, duration: 0.5 }}>
            I showed the early version to a few friends. They loved the vibe, suggested a few tweaks, and actually started using it themselves. That was the spark. DURIO quickly evolved from a weekend script into a real ecosystem. 
          </motion.p>
          <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 0.8, duration: 0.5 }}>
            I began adding modules, implementing proper security features, building out the mobile application, and expanding it into the complete productivity companion you see today. It was built for us, and now it's built for you.
          </motion.p>
          <motion.p initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ delay: 1.0, duration: 0.5 }}>
            By the way, if you're curious about how this all comes together, the entire <a href="https://github.com/MohammedIrfan244/to-do-app" target="_blank" rel="noopener noreferrer" className="text-[#ff6a00] hover:text-[#ff8c40] underline decoration-[#ff6a00]/30 hover:decoration-[#ff6a00] transition-colors">codebase is open source</a>. 
            Feel free to poke around my <a href="https://github.com/MohammedIrfan244" target="_blank" rel="noopener noreferrer" className="text-[#ff6a00] hover:text-[#ff8c40] underline decoration-[#ff6a00]/30 hover:decoration-[#ff6a00] transition-colors">GitHub profile</a> or check out my <a href="https://mohammed-irfan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[#ff6a00] hover:text-[#ff8c40] underline decoration-[#ff6a00]/30 hover:decoration-[#ff6a00] transition-colors">portfolio</a>. I'm always down to chat about code, design, or whatever you're building. ✌️
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
