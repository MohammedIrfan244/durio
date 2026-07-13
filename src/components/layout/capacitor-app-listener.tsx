"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";

export default function CapacitorAppListener() {
  useEffect(() => {
    const listener = App.addListener("appUrlOpen", ({ url }) => {
      console.log("App opened with URL:", url);
      
      // Pass the deep link URL to the internal Next.js router / window
      // Specifically target NextAuth callbacks
      if (url.includes("/api/auth/callback")) {
        const urlObj = new URL(url);
        // Navigate the WebView to exactly the callback path with search params
        window.location.href = urlObj.pathname + urlObj.search;
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  return null;
}