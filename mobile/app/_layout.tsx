import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, RubikGlitch_400Regular } from '@expo-google-fonts/rubik-glitch';
import AppLoading from 'expo-app-loading';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    RubikGlitch: RubikGlitch_400Regular,
  });

  if (!fontsLoaded) {
    return <AppLoading />; // 폰트 로드 완료 전까지 스플래시 유지
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
