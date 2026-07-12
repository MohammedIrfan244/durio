"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PrivacyModal from "@/components/auth/login/privacy-policy";
import ContactModal from "./contact-modal";

export function CtaFooter() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <section className="py-24 sm:py-40 bg-[#ff6a00] text-center relative overflow-hidden">
        {/* Wild background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-white mix-blend-overlay rounded-[40%] blur-3xl opacity-30" 
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.5, 1] }} 
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -right-20 w-[800px] h-[800px] bg-white mix-blend-overlay rounded-[45%] blur-3xl opacity-20" 
          />
        </div>

        {/* Scattered chaotic text */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [-5, -2, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-[10%] text-white/40 font-[family-name:var(--font-heading)] text-4xl font-bold"
        >
          I've got your back.
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [10, 5, 10] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-32 right-[15%] text-white/40 font-[family-name:var(--font-heading)] text-5xl font-bold"
        >
          Together.
        </motion.div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            className="space-y-12"
          >
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black font-[family-name:var(--font-heading)] text-white drop-shadow-lg leading-none">
              Ready?<br />
              <span className="inline-block mt-4 -rotate-3 text-white">I've been waiting.</span>
            </h2>
            
            <div className="flex justify-center relative">
              <Link href="/dashboard">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                    <Button size="lg" className="w-full sm:w-auto bg-white text-[#ff6a00] hover:bg-orange-50 font-[family-name:var(--font-heading)] font-bold text-xl sm:text-2xl rounded-[2rem] px-8 sm:px-12 py-8 sm:py-10 shadow-2xl transition-all border-b-8 border-orange-200">
                      Let's start
                    </Button>
                  </motion.div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-black py-16 border-t border-white/10 relative z-20">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <img 
               src="https://res.cloudinary.com/doseusf1y/image/upload/v1783781057/durio_u3ixtn.png"
               alt="DURIO Logo"
               className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer"
            />
            <span className="text-muted-foreground font-[family-name:var(--font-body)] text-sm">
              &copy; 2026 DURIO
            </span>
            <span className="text-muted-foreground/50 font-[family-name:var(--font-body)] text-xs italic sm:ml-4">
              Still here.
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-muted-foreground font-[family-name:var(--font-body)] text-sm font-semibold">
            <Link href="/dashboard" className="hover:text-[#ff6a00] transition-colors">
              Web App
            </Link>
            <span className="opacity-30">|</span>
            <button onClick={() => setPrivacyOpen(true)} className="hover:text-white transition-colors text-muted-foreground">
              Privacy
            </button>
            <span className="opacity-30">|</span>
            <button onClick={() => setContactOpen(true)} className="hover:text-white transition-colors text-muted-foreground">
              Contact
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
