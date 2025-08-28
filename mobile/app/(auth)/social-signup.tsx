import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { api } from '../../src/lib/api';

export default function SocialSignup() {
  const r = useRouter();
  const params = useLocalSearchParams<{ email?: string; name?: string; provider?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [name, setName] = useState(params.name ?? '');
  const [gender, setGender] = useState<'MALE'|'FEMALE'>('MALE');
  const [birth, setBirth] = useState('2000-01-01');
  const [zipcode, setZipcode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const provider = (params.provider ?? 'kakao').toString().toLowerCase();

  async function onSubmit() {
    try {
      const payload = { email, name, gender, birth, zipcode, address1, address2 };
      if (provider === 'kakao') {
        await api.post('/api/auth/kakao-signup', payload);
      } else {
        await api.post('/api/auth/google-signup', payload);
      }
      Alert.alert('완료', '회원가입 성공! 다시 소셜 로그인 버튼을 눌러 로그인해 주세요.');
      r.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('회원가입 실패', e?.response?.data?.message || e?.message || '에러');
    }
  }

  return (
    <View style={{ flex:1, padding:20, gap:10 }}>
      <Text style={{ fontSize:22, fontWeight:'800' }}>소셜 회원가입</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="이메일" style={input} />
      <TextInput value={name} onChangeText={setName} placeholder="이름" style={input} />
      <TextInput value={birth} onChangeText={setBirth} placeholder="생년월일(YYYY-MM-DD)" style={input} />
      <TextInput value={zipcode} onChangeText={setZipcode} placeholder="우편번호" style={input} />
      <TextInput value={address1} onChangeText={setAddress1} placeholder="주소" style={input} />
      <TextInput value={address2} onChangeText={setAddress2} placeholder="상세주소" style={input} />
      <Pressable onPress={onSubmit} style={{ backgroundColor:'#111', padding:14, borderRadius:10, alignItems:'center' }}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>가입하기</Text>
      </Pressable>
    </View>
  );
}
const input = { borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 } as const;
