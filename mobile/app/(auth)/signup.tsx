import React, { useState } from 'react';
import { useRouter, Stack, useNavigation } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, BackHandler } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { signup } from '../../src/lib/api';
import AddressSearchModal from '../../components/AddressSearchModal';

type Gender = 'MALE' | 'FEMALE';

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const INPUT_HEIGHT = Platform.select({ ios: 45, android: 48 });

export default function SignUpScreen() {
  const r = useRouter();
  const nav = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [addrModal, setAddrModal] = useState(false);
  const [gender, setGender] = useState<Gender>('MALE');
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1));
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    const pwOk = password.length >= 8 && password.length <= 20;
    const nameOk = name.trim().length > 0 && name.length <= 30;
    const zipOk = zipcode.length <= 10;
    const addr1Ok = address1.length <= 255;
    const addr2Ok = address2.length <= 255;

    if (!emailOk) return '이메일 형식을 확인해주세요!';
    if (!pwOk) return '비밀번호는 8~20자입니다.';
    if (!nameOk) return '이름은 1~30자입니다.';
    if (!zipOk) return '우편번호는 10자 이하입니다.';
    if (!addr1Ok || !addr2Ok) return '주소는 255자 이하입니다.';
    return null;
  };

  const openPicker = () => setPickerVisible(true);
  const closePicker = () => setPickerVisible(false);

  const onConfirmBirth = (selected: Date) => {
    setBirthDate(selected);
    closePicker();
  };

  // 주소 선택 완료
  const handleAddressComplete = (d: {
    zonecode: string;
    address: string;
    defaultAddress?: string;
  }) => {
    setZipcode(d.zonecode);
    setAddress1(d.address);
    // 상세주소 비어있으면 기본 상세(건물명 등) 채워주기
    if (!address2 && d.defaultAddress) setAddress2(d.defaultAddress);
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      Alert.alert('입력 확인', err);
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        email,
        password,
        name,
        zipcode: zipcode || undefined,
        address1: address1 || undefined,
        address2: address2 || undefined,
        gender,
        birth: fmt(birthDate),
      });

      // 백엔드 ResponseDto 구조 가정: { status, code, message, data? }
      Alert.alert('회원가입', res?.message ?? '회원가입 성공');
      r.replace('/(auth)/login');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        '회원가입 중 오류가 발생했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>회원가입</Text>

        <LabeledInput
          label="이메일"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <LabeledInput
          label="비밀번호 (8~20자)"
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
        />
        <LabeledInput
          label="이름"
          value={name}
          onChangeText={setName}
          placeholder="홍길동"
        />

        <Text style={styles.label}>성별</Text>
        <View style={styles.genderWrap}>
          <GenderPill text="남성" selected={gender === 'MALE'} onPress={() => setGender('MALE')} />
          <GenderPill text="여성" selected={gender === 'FEMALE'} onPress={() => setGender('FEMALE')} />
        </View>

        <View style={[{ flex: 1 }, styles.sectionGap]}>
            <Text style={styles.label}>생년월일</Text>
            <TouchableOpacity style={styles.input} onPress={openPicker}>
                <Text style={{ fontSize: 16, color: '#111827' }}>{fmt(birthDate)}</Text>
            </TouchableOpacity>

            {/* 모달 달력 */}
            <DateTimePickerModal
                isVisible={pickerVisible}
                mode="date"
                display={Platform.select({ ios: 'inline', android: 'calendar' })}
                date={birthDate}
                maximumDate={new Date()} // 미래 선택 방지
                onConfirm={onConfirmBirth}
                onCancel={closePicker}

                locale="ko-KR"
                confirmTextIOS="확인"
                cancelTextIOS="취소"

                pickerContainerStyleIOS={{
                    width: '100%',
                    alignSelf: 'stretch',
                    paddingHorizontal: 16,
                    backgroundColor: '#000',
                }}

                customHeaderIOS={() => (
                    <View style={{
                    paddingHorizontal: 16, paddingVertical: 12,
                    borderBottomWidth: 1, borderColor: '#eee',
                    alignItems: 'center'
                    }}>
                    <Text style={{ fontSize: 16, fontWeight: '700' }}>생년월일 선택</Text>
                    </View>
                )}
            />
        </View>

        {/* 주소 라인 */}
        <Text style={styles.label}>주소</Text>
        <View style={[styles.row, { gap: 8, marginBottom: 8 }]}>
        <View style={{ flex: 1 }}>
            <TextInput
            style={[styles.input, { height: INPUT_HEIGHT, textAlignVertical: 'center' }]}
            placeholder="우편번호"
            value={zipcode}
            onChangeText={setZipcode}
            keyboardType="number-pad"
            />
        </View>

        <TouchableOpacity
            onPress={() => setAddrModal(true)}
            style={[styles.button, styles.searchBtn]}
        >
            <Text style={styles.buttonText}>검색</Text>
        </TouchableOpacity>
        </View>

      <TextInput
        style={[styles.input, { marginBottom: 8 }]}
        placeholder="도로명/지번 주소"
        value={address1}
        onChangeText={setAddress1}
      />
      <TextInput
        style={styles.input}
        placeholder="상세 주소"
        value={address2}
        onChangeText={setAddress2}
      />

      {/* 모달 */}
      <AddressSearchModal
        visible={addrModal}
        onClose={() => setAddrModal(false)}
        onComplete={handleAddressComplete}
      />

        <TouchableOpacity
          onPress={onSubmit}
          style={[styles.button, loading && { opacity: 0.6 }]}
          disabled={loading}
        >
          {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>가입하기</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LabeledInput(props: any) {
  const { label, ...rest } = props;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        {...rest}
      />
    </View>
  );
}

function GenderPill({
  text,
  selected,
  onPress,
}: {
  text: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.pill,
        selected && { backgroundColor: '#111827' },
      ]}
    >
      <Text style={[styles.pillText, selected && { color: '#fff' }]}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 120,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  pillText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  searchBtn: {
    height: INPUT_HEIGHT,
    paddingVertical: 0,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 0,
  },
  sectionGap: {
    marginBottom: 13,
  },
});
