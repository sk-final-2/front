import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, StyleSheet, ScrollView } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AddressSearchModal from '../../components/AddressSearchModal';
import { mobileGoogleSignup } from '../../src/lib/api';
import { saveLoginTokens } from '../../src/lib/auth';
import { fmt } from './_util';

type Gender = 'MALE' | 'FEMALE';
const INPUT_HEIGHT = Platform.select({ ios: 45, android: 48 });

export default function GoogleSignup() {
  const { email = '', name = '' } = useLocalSearchParams<{email?: string; name?: string;}>();
  const r = useRouter();

  const [form, setForm] = useState({
    email: String(email),
    name: String(name || ''),
    zipcode: '',
    address1: '',
    address2: '',
    gender: 'MALE' as Gender,
    birth: new Date(2000, 0, 1),
  });

  const [addrModal, setAddrModal] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const onAddrComplete = (d: { zonecode: string; address: string; defaultAddress?: string }) => {
    setForm(prev => ({
      ...prev,
      zipcode: d.zonecode,
      address1: d.address,
      address2: prev.address2 || d.defaultAddress || '',
    }));
  };

  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return '이메일 형식을 확인해주세요!';
    if (!form.name || form.name.length > 30) return '이름은 1~30자입니다.';
    if (form.zipcode.length > 10) return '우편번호는 10자 이하입니다.';
    if (form.address1.length > 255 || form.address2.length > 255) return '주소는 255자 이하입니다.';
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) return Alert.alert('입력 확인', err);

    try {
      setLoading(true);
      const res = await mobileGoogleSignup({
        email: form.email,
        name: form.name,
        gender: form.gender,
        birth: fmt(form.birth),
        zipcode: form.zipcode || undefined,
        address1: form.address1 || undefined,
        address2: form.address2 || undefined,
      });

      //await saveLoginTokens(res.accessToken, res.rtid);
      Alert.alert('가입 완료', '환영합니다!');
      r.replace('/(app)');
    } catch (e: any) {
      Alert.alert('가입 실패', e?.response?.data?.message || e?.message || '에러');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Google 회원가입</Text>

      <Text style={styles.label}>이메일</Text>
      <TextInput style={[styles.input, { backgroundColor:'#f7f7f7' }]} value={form.email} editable={false} />

      <Text style={styles.label}>이름</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(t) => setForm(prev => ({ ...prev, name: t }))}
        placeholder="홍길동"
      />

      <Text style={styles.label}>성별</Text>
      <View style={styles.genderWrap}>
        <Pill text="남성" selected={form.gender==='MALE'} onPress={() => setForm(prev => ({...prev, gender:'MALE'}))} />
        <Pill text="여성" selected={form.gender==='FEMALE'} onPress={() => setForm(prev => ({...prev, gender:'FEMALE'}))} />
      </View>

      <Text style={styles.label}>생년월일</Text>
      <TouchableOpacity style={styles.input} onPress={() => setPickerVisible(true)}>
        <Text style={{ fontSize:16 }}>{fmt(form.birth)}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={pickerVisible}
        mode="date"
        display={Platform.select({ ios: 'inline', android: 'calendar' })}
        date={form.birth}
        maximumDate={new Date()}
        onConfirm={(d) => { setForm(prev => ({...prev, birth:d})); setPickerVisible(false); }}
        onCancel={() => setPickerVisible(false)}
        locale="ko-KR"
        confirmTextIOS="확인"
        cancelTextIOS="취소"
      />

      <Text style={styles.label}>주소</Text>
      <View style={[styles.row, { gap: 8, marginBottom: 8 }]}>
        <TextInput
          style={[styles.input, { flex:1, height: INPUT_HEIGHT }]}
          placeholder="우편번호"
          value={form.zipcode}
          keyboardType="number-pad"
          onChangeText={(t) => setForm(prev => ({...prev, zipcode:t}))}
        />
        <TouchableOpacity onPress={() => setAddrModal(true)} style={[styles.searchBtn]}>
          <Text style={{ color:'#fff', fontWeight:'800' }}>검색</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={[styles.input, { marginBottom: 8 }]}
        placeholder="도로명/지번 주소"
        value={form.address1}
        onChangeText={(t) => setForm(prev => ({...prev, address1:t}))}
      />
      <TextInput
        style={styles.input}
        placeholder="상세 주소"
        value={form.address2}
        onChangeText={(t) => setForm(prev => ({...prev, address2:t}))}
      />
      <AddressSearchModal visible={addrModal} onClose={() => setAddrModal(false)} onComplete={onAddrComplete} />

      <TouchableOpacity onPress={onSubmit} disabled={loading} style={[styles.submitBtn, loading && { opacity:0.7 }]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Google로 가입하기</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Pill({ text, selected, onPress }: { text:string; selected:boolean; onPress:()=>void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, selected && { backgroundColor:'#4285F4' }]}>
      <Text style={[styles.pillText, selected && { color:'#fff' }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding:20, paddingTop:110, paddingBottom:20, backgroundColor:'#ffffff' },
  title: { fontSize:24, fontWeight:'900', marginBottom:18, color:'#202124' },
  label: { fontSize:14, color:'#5f6368', marginBottom:6 },
  input: {
    borderWidth:1, borderColor:'#e0e0e0', borderRadius:12,
    paddingHorizontal:12, paddingVertical:Platform.select({ ios:12, android:10 }),
    backgroundColor:'#fff'
  },
  row: { flexDirection:'row', alignItems:'center' },
  genderWrap: { flexDirection:'row', gap:8, marginBottom:16 },
  pill: { paddingHorizontal:14, paddingVertical:10, borderRadius:999, borderWidth:1, borderColor:'#e0e0e0', backgroundColor:'#fff' },
  pillText: { fontSize:14, color:'#202124', fontWeight:'700' },
  searchBtn: {
    height: INPUT_HEIGHT, paddingHorizontal:16, justifyContent:'center',
    borderRadius:10, backgroundColor:'#4285F4'
  },
  submitBtn: { marginTop:18, backgroundColor:'#4285F4', paddingVertical:14, borderRadius:12, alignItems:'center' },
  submitText: { fontSize:16, fontWeight:'900', color:'#fff' },
});
