import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.snug.app',
  appName: 'Snug',
  webDir: 'out', // Next.js static export directory

  server: {
    // For development with live reload
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:5757' : undefined,
    cleartext: true,
  },

  ios: {
    contentInset: 'automatic',
    scheme: 'Snug',
    preferredContentMode: 'mobile',
  },

  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true,
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
