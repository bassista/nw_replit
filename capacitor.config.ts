import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sgambato.nutritionwise',
  appName: 'nutritionwise',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
