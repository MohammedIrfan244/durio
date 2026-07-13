import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.zemo.durio',
  appName: 'Durio',
  server: {
    url: "https://durio.vercel.app",
    cleartext: false,
  },
};

export default config;
