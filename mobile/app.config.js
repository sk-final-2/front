// mobile/app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: 'mobile',
  slug: 'mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'mobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  ios: {
    ...(config.ios || {}),
    supportsTablet: true,
    // ⬇️ iOS 권한 설명 추가
    infoPlist: {
      ...(config.ios?.infoPlist || {}),
      NSCameraUsageDescription:
        '면접 답변 영상을 촬영하기 위해 카메라 권한이 필요합니다.',
      NSMicrophoneUsageDescription:
        '면접 답변의 음성을 녹음하기 위해 마이크 권한이 필요합니다.',
    },
  },

  android: {
    ...(config.android || {}),
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    // ⬇️ 안드로이드 권한 (expo-camera/AV 사용 시 필요)
    permissions: [
      ...(config.android?.permissions || []),
      'CAMERA',
      'RECORD_AUDIO',
    ],
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
    // (카메라/녹화 쓸 거면 설치되어 있어야 합니다)
    // 'expo-camera',
    // 'expo-av',
    'expo-web-browser', 
  ],

  experiments: { typedRoutes: true },

  extra: {
    API_BASE: process.env.API_BASE,
    WS_BASE: process.env.WS_BASE,
    OAUTH_BACKEND_BASE: process.env.OAUTH_BACKEND_BASE
  },
});
