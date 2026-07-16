"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, TerminalSquare } from "lucide-react";

export function StorySection() {
  const { scrollYProgress } = useScroll();
  const yOffset = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0.8, 1], [0.5, 1]);

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32 flex flex-col items-center justify-center">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <motion.div 
        style={{ y: yOffset }}
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/20 blur-[100px] rounded-full pointer-events-none" 
      />

      <div className="container relative z-10 px-6 max-w-4xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/50 border border-border/50 text-muted-foreground shadow-sm">
            <TerminalSquare size={24} />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            So, how did we get here?
          </h2>
          <p className="text-lg text-muted-foreground italic mb-12 max-w-2xl">
            "If you scrolled this far, maybe you want to hear how this all started out..."
          </p>
        </motion.div>

        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative text-left space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed bg-card/40 border border-border/50 p-8 md:p-12 rounded-3xl backdrop-blur-sm shadow-xl"
        >
          <div className="absolute -top-4 -left-4 text-primary opacity-20">
            <Sparkles size={48} />
          </div>
          
          <p>
            Durio began as a simple, local to-do list I built just so I could manage my own work easily. Nothing crazy, just something quick that wouldn't get in my way. Then, I added a local notepad because keeping thoughts in the same place made sense.
          </p>
          <p>
            Before I knew it, the thought hit me: <strong className="text-foreground font-medium">Why not build a full application that handles all aspects of my life?</strong>
          </p>
          <p>
            I showed the early version to a few friends. They loved the vibe, suggested a few tweaks, and actually started using it themselves. That was the spark. Durio quickly evolved from a weekend script into a real ecosystem. 
          </p>
          <p>
            I began adding modules, implementing proper security features, building out the mobile application, and expanding it into the complete productivity companion you see today. It was built for us, and now it's built for you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
