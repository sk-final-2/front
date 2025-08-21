import { View, Text, Pressable, Alert } from 'react-native';
import { clearTokens } from '../../src/lib/auth';
import { useRouter } from 'expo-router';

export default function Home() {
  const r = useRouter();
  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:12 }}>
      <Text style={{ fontSize:18 }}>로그인 성공! 여기가 메인</Text>
      <Pressable onPress={async ()=>{ await clearTokens(); Alert.alert('로그아웃'); r.replace('/(auth)/login'); }}
        style={{ padding:12, backgroundColor:'#eee', borderRadius:8 }}>
        <Text>로그아웃</Text>
      </Pressable>
    </View>
  );
}
