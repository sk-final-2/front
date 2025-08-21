// mobile/app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,                         // 기존 값 유지(있다면)
  name: 'mobile',
  slug: 'mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  ios: { supportsTablet: true },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
  },

  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],

  experiments: { typedRoutes: true },

  // ⬇️ 여기서 환경변수 주입
  extra: {
    API_BASE: process.env.API_BASE,
    WS_BASE: process.env.WS_BASE,
  },
});
