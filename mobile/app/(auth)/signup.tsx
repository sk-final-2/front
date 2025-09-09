import React, { useState, useEffect } from 'react';
import { useRouter, Stack, useNavigation } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, BackHandler } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { signup, sendEmailCode, verifyEmailCode } from '../../src/lib/api';
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
  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null); // 어떤 이메일로 보냈는지
  const [leftSec, setLeftSec] = useState(0); // 재전송 타이머(초)
  const VERIF_TTL = 180; // 3분

  // 이메일이 바뀌면 인증 초기화
  useEffect(() => {
    setEmailVerified(false);
    setEmailCode('');
    // 보낸 주소와 다르면 타이머도 숨김
    if (codeSentTo && codeSentTo !== email) {
      setLeftSec(0);
    }
  }, [email]);

  useEffect(() => {
    if (leftSec <= 0) return;
    const t = setInterval(() => setLeftSec(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [leftSec]);

  const sendCode = async () => {
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    if (!emailOk) {
      Alert.alert('입력 확인', '이메일 형식을 확인해주세요!');
      return;
    }
    try {
      setSendLoading(true);
      await sendEmailCode(email);
      setCodeSentTo(email);
      setLeftSec(VERIF_TTL);
      Alert.alert('이메일 인증', '인증코드를 전송했어요. 메일함을 확인해주세요.');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '인증코드 전송 실패';
      Alert.alert('오류', msg);
    } finally {
      setSendLoading(false);
    }
  };

  const doVerify = async () => {
    if (!emailCode.trim()) {
      Alert.alert('입력 확인', '인증코드를 입력해주세요.');
      return;
    }
    try {
      setVerifyLoading(true);
      await verifyEmailCode(email, emailCode.trim());
      setEmailVerified(true);
      setLeftSec(0);
      Alert.alert('이메일 인증', '인증이 완료됐어요!');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '인증 실패';
      Alert.alert('오류', msg);
    } finally {
      setVerifyLoading(false);
    }
  };

  const validate = () => {
    const emailOk = /^\S+@\S+\.\S+$/.test(email);
    const pwOk = password.length >= 8 && password.length <= 20;
    const nameOk = name.trim().length > 0 && name.length <= 30;
    const zipOk = zipcode.length <= 10;
    const addr1Ok = address1.length <= 255;
    const addr2Ok = address2.length <= 255;

    if (!emailOk) return '이메일 형식을 확인해주세요!';
    if (!emailVerified) return '이메일 인증을 먼저 완료해주세요.';
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

        {/* 이메일 */}
        <Text style={styles.label}>이메일</Text>
        <View style={[styles.row, { gap: 8, marginBottom: 10 }]}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!emailVerified} // 인증 후 잠글지 여부(원하면 true로)
          />

          {emailVerified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>인증완료</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={sendCode}
              style={[styles.smallBtn, sendLoading && { opacity: 0.6 }]}
              disabled={sendLoading}
            >
              {sendLoading ? <ActivityIndicator /> : <Text style={styles.smallBtnText}>
                {leftSec > 0 ? '재전송' : '인증코드 받기'}
              </Text>}
            </TouchableOpacity>
          )}
        </View>

        {/* 코드 입력: 보낸 적 있고 아직 인증 전 + 보낸 이메일이 현재 입력 이메일과 동일할 때만 노출 */}
        {!emailVerified && codeSentTo === email && (
          <View style={{ marginBottom: 12 }}>
            <View style={[styles.row, { gap: 8 }]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="인증코드 6자리"
                value={emailCode}
                onChangeText={(t) => setEmailCode(t.replace(/\s/g, '').slice(0, 10))} // 길이 여유
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={doVerify}
                style={[styles.smallBtn, verifyLoading && { opacity: 0.6 }]}
                disabled={verifyLoading}
              >
                {verifyLoading ? <ActivityIndicator /> : <Text style={styles.smallBtnText}>인증 확인</Text>}
              </TouchableOpacity>
            </View>

            {/* 남은 시간/재전송 안내 */}
            {leftSec > 0 && (
              <Text style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                {`남은시간 ${String(Math.floor(leftSec / 60)).padStart(2, '0')}:${String(leftSec % 60).padStart(2, '0')} (시간 만료 후 재전송 가능)`}
              </Text>
            )}
          </View>
        )}

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
          style={[styles.button, (loading || !emailVerified) && { opacity: 0.6 }]}
          disabled={loading || !emailVerified}
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
  smallBtn: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  smallBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  verifiedBadge: {
    backgroundColor: '#16a34a22',
    borderColor: '#16a34a',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: Platform.select({ ios: 45, android: 48 }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#16a34a',
    fontWeight: '800',
    fontSize: 13,
  },
});
