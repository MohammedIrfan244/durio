"use client";

import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

export function useCapacitor() {
  const [isCapacitor, setIsCapacitor] = useState<boolean | null>(null);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    setIsCapacitor(isNative);
    
    if (isNative) {
      document.documentElement.classList.add("capacitor-app");
    }
  }, []);

  return isCapacitor;
}
