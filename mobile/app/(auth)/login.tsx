import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginWithEmail } from '../../src/lib/api';
import { saveTokens } from '../../src/lib/auth';

export default function LoginScreen() {
  const r = useRouter();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test1234');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      setLoading(true);
      const { accessToken, refreshToken } = await loginWithEmail(email, password);
      await saveTokens(accessToken, refreshToken);
      Alert.alert('로그인 성공');
      r.replace('/(app)'); // 메인으로 이동
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.response?.data?.message || e?.message || '에러');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex:1, padding:20, justifyContent:'center', gap:12 }}>
      <Text style={{ fontSize:24, fontWeight:'600' }}>로그인</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="이메일"
        keyboardType="email-address"
        style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12 }}
      />

      <Pressable onPress={onSubmit} disabled={loading}
        style={{ backgroundColor:'#111', padding:14, borderRadius:8, opacity:loading?0.6:1 }}>
        <Text style={{ color:'#fff', textAlign:'center', fontWeight:'600' }}>
          {loading ? '로그인 중...' : '로그인'}
        </Text>
      </Pressable>
    </View>
  );
}
