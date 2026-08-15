import { Metadata } from 'next';
import { APP_NAME } from '@/lib/brand';
import PrivacyPolicyPage from '@/components/pages/static-pages/privacy-policy';

export const metadata: Metadata = {
  title: `${APP_NAME}- Privacy Policy`,
  description: 'Privacy policy for DURIO - how we handle your data',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <PrivacyPolicyPage/>
  );
}
