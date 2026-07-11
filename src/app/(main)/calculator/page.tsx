import { redirect } from 'next/navigation';
import { APP_NAME } from '@/lib/brand';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Calculator - ${APP_NAME}`,
  description:
    "Powerful calculation tools in one place — essential, scientific, graphing, matrix, statistics, and complex math.",
  openGraph: {
    title: `Calculator - ${APP_NAME}`,
    description: "A full suite of calculator tools: essential, scientific, graphing, matrix, and more.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Calculator - ${APP_NAME}`,
    description: "A full suite of calculator tools: essential, scientific, graphing, matrix, and more.",
  },
};

export default function CalculatorRedirect() {
  redirect('/calculator/essential');
}