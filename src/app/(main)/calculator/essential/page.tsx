import React from 'react';
import Calculator from '@/components/pages/calculator/calculator';
import { APP_NAME } from '@/lib/brand';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Essential Calculator - ${APP_NAME}`,
  description:
    "Your everyday calculation toolkit — arithmetic, unit conversions, and quick math, all in one place.",
  openGraph: {
    title: `Essential Calculator - ${APP_NAME}`,
    description: "Everyday arithmetic, conversions, and quick math essentials.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Essential Calculator - ${APP_NAME}`,
    description: "Everyday arithmetic, conversions, and quick math essentials.",
  },
};


export default function EssentialCalculatorPage() {
  return <Calculator />;
}
