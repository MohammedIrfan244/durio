import React from 'react';
import Calculator from '@/components/pages/calculator/calculator';
import { APP_NAME } from '@/lib/brand';

export const metadata = {
    title: `${APP_NAME} - Essential Toolkit`,
    description: "Everyday computing essentials.",
};

export default function EssentialCalculatorPage() {
  return <Calculator />;
}
