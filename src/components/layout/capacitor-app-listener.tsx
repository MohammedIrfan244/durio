"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";

export default function CapacitorAppListener() {
  useEffect(() => {
    const listener = App.addListener("appUrlOpen", ({ url }) => {
      console.log("App opened with URL:", url);
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  return null;
}