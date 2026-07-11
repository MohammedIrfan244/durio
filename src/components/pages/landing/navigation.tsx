"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import images from "@/asset/images.json";

export function Navigation() {
  const { scrollY } = useScroll();
  
  // Add momentum to the scroll using useSpring
  const smoothScrollY = useSpring(scrollY, { stiffness: 50, damping: 20 });
  
  // Create continuous scroll animations instead of a hard toggle
  const navY = useTransform(smoothScrollY, [0, 100], [0, 10]);
  const opacity = useTransform(smoothScrollY, [0, 200], [1, 0.8]);
  const scale = useTransform(smoothScrollY, [0, 200], [1, 0.95]);

  return (
    <motion.nav
      style={{ y: navY, opacity, scale }}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 px-4 py-2 flex items-center justify-between bg-black/20 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl"
    >
      <Link href="/" className="flex items-center group h-8 w-8 rounded-full overflow-hidden">
        <motion.img
          whileHover={{ rotate: -10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          src={images.durio}
          alt="DURIO Logo"
          className="w-full h-full object-contain drop-shadow-lg"
        />
      </Link>

      <div className="flex items-center gap-3">
        <Link href="#android">
          <Button variant="ghost" size="sm" className="font-[family-name:var(--font-body)] text-white/70 hover:text-white hover:bg-white/10 rounded-full text-sm">
            Android App
          </Button>
        </Link>
        <Link href="/dashboard">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button size="sm" className="bg-[#ff6a00] hover:bg-[#ff6a00]/90 text-white font-[family-name:var(--font-body)] rounded-full px-4 text-sm shadow-[0_0_15px_rgba(255,106,0,0.3)] hover:shadow-[0_0_25px_rgba(255,106,0,0.5)] transition-shadow border border-[#ff6a00]/50">
              Open App
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.nav>
  );
}
