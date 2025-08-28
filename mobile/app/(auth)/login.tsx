import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginWithEmail } from '../../src/lib/api';
import { startSocialLogin } from '../../src/lib/social';

export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'kakao' | 'google' | null>(null);

  async function onEmailLogin() {
    try {
      setLoading(true);
      const profile = await loginWithEmail(email, password);
      Alert.alert('로그인 성공', `${profile.name}님 환영합니다!`);
      r.replace('/(app)');
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.response?.data?.message || e?.message || '에러');
    } finally {
      setLoading(false);
    }
  }

   async function onSocial(provider: 'kakao' | 'google') {
    try {
      setLoading(true);
      const res = await startSocialLogin(provider);

      if (res.needSignup) {
        // ▶︎ 카카오/구글 별 가입 폼으로 라우팅
        const pathname =
          (res.provider ?? provider) === 'kakao'
            ? '/(auth)/kakao-signup'
            : '/(auth)/google-signup';

        r.push({
          pathname,
          params: {
            email: res.email ?? '',
            name: res.name ?? '',
          },
        });
        return;
      }

      Alert.alert('로그인 성공');
      r.replace('/(app)');
    } catch (e: any) {
      Alert.alert('소셜 로그인 실패', e?.message ?? '에러');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex:1, padding:20, justifyContent:'center', gap:14 }}>
      <Text style={{ fontSize:24, fontWeight:'800' }}>로그인</Text>

      {/* 이메일/비번 */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호"
        secureTextEntry
        style={{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 }}
      />

      <Pressable
        onPress={onEmailLogin}
        disabled={loading || !!socialLoading}
        style={{ backgroundColor:'#111', padding:14, borderRadius:10, alignItems:'center', opacity:(loading||socialLoading)?0.6:1 }}
      >
        <Text style={{ color:'#fff', fontWeight:'700' }}>
          {loading ? '로그인 중…' : '이메일로 로그인'}
        </Text>
      </Pressable>

      {/* 일반 회원가입 이동 */}
      <Pressable
        onPress={() => r.push('/(auth)/signup')}
        disabled={loading || !!socialLoading}
        style={{ padding:12, alignItems:'center' }}
      >
        <Text style={{ color:'#4f46e5', fontWeight:'700' }}>아직 계정이 없나요? 회원가입</Text>
      </Pressable>

      {/* 소셜 구분선 */}
      <View style={{ height:1, backgroundColor:'#eee', marginVertical:6 }} />
      <Text style={{ color:'#666', textAlign:'center' }}>또는</Text>

      {/* 카카오 */}
      <Pressable
        onPress={() => onSocial('kakao')}
        disabled={!!socialLoading || loading}
        style={{ backgroundColor:'#FEE500', padding:14, borderRadius:10, alignItems:'center', opacity:(!!socialLoading||loading)?0.6:1 }}
      >
        <Text style={{ fontWeight:'800' }}>
          {socialLoading === 'kakao' ? '카카오로 연결 중…' : '카카오로 계속하기'}
        </Text>
      </Pressable>

      {/* 구글 */}
      <Pressable
        onPress={() => onSocial('google')}
        disabled={!!socialLoading || loading}
        style={{ backgroundColor:'#fff', padding:14, borderRadius:10, borderWidth:1, borderColor:'#ddd', alignItems:'center', opacity:(!!socialLoading||loading)?0.6:1 }}
      >
        <Text style={{ fontWeight:'800' }}>
          {socialLoading === 'google' ? 'Google로 연결 중…' : 'Google로 계속하기'}
        </Text>
      </Pressable>
    </View>
  );
}
