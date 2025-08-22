// mobile/components/EditProfileModal.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, ActivityIndicator, Alert, ScrollView, Pressable, KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddressSearchModal from './AddressSearchModal';
import { updateMyPage, type MyPageResponse } from '../src/lib/api';

const INPUT_HEIGHT = Platform.select({ ios: 45, android: 48 });

export default function EditProfileModal({
  visible,
  profile,
  onClose,
  onSaved,
}: {
  visible: boolean;
  profile: MyPageResponse | null;
  onClose: () => void;
  onSaved: (updated: MyPageResponse) => void;
}) {
  // 수정 가능한 필드
  const [postcode, setPostcode] = useState(profile?.postcode ?? '');
  const [address1, setAddress1] = useState(profile?.address1 ?? '');
  const [address2, setAddress2] = useState(profile?.address2 ?? '');
  const [newPw, setNewPw] = useState('');
  const [newPw2, setNewPw2] = useState('');

  const [addrModal, setAddrModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();

  // 모달 열릴 때마다 최신값으로 초기화
  useEffect(() => {
    if (!visible) return;
    setPostcode(profile?.postcode ?? '');
    setAddress1(profile?.address1 ?? '');
    setAddress2(profile?.address2 ?? '');
    setNewPw('');
    setNewPw2('');
  }, [visible, profile]);

  const onSubmit = async () => {
    // 비밀번호 검증 (입력했을 때만)
    if (newPw || newPw2) {
      if (newPw.length < 8) {
        Alert.alert('비밀번호', '새 비밀번호는 8자 이상으로 입력해주세요.');
        return;
      }
      if (newPw !== newPw2) {
        Alert.alert('비밀번호', '새 비밀번호가 서로 일치하지 않습니다.');
        return;
      }
    }

    // 전송 바디: 서버가 허용하는 필드만!
    const body: {
      newPassword?: string;
      postcode?: string;
      address1?: string;
      address2?: string;
    } = {};

    if (newPw) body.newPassword  = newPw; // 입력했을 때만 포함
    body.postcode = postcode?.trim() || '';
    body.address1 = address1?.trim() || '';
    body.address2 = address2?.trim() || '';

    setSaving(true);
    try {
      const updated = await updateMyPage(body);
      onSaved(updated);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '수정 중 오류가 발생했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible && !addrModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={onClose}
      >

        {/* 키보드 회피 뷰로 전체를 감쌈 */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={insets.top + 12} // 헤더 높이만큼 여유
        >

        <View style={s.backdrop}>
          <Pressable style={s.overlay} onPress={onClose} />
          <View style={s.card}>
            {/* 헤더 */}
            <View style={s.header}>
              <TouchableOpacity onPress={onClose} style={s.hBtn}>
                <Text style={s.hBtnText}>닫기</Text>
              </TouchableOpacity>
              <Text style={s.hTitle}>프로필 수정</Text>
              <TouchableOpacity
                onPress={onSubmit}
                style={[s.hBtn, { opacity: saving ? 0.6 : 1 }]}
                disabled={saving}
              >
                {saving ? <ActivityIndicator /> : (
                  <Text style={[s.hBtnText, { color: '#2563eb', fontWeight: '800' }]}>
                    저장
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 내용 */}
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
              {/* 비밀번호 변경 (선택) */}
              <Labeled label="새 비밀번호 (선택)">
                <TextInput
                  style={s.input}
                  value={newPw}
                  onChangeText={setNewPw}
                  placeholder="변경하지 않으려면 비워두세요"
                  secureTextEntry
                  textContentType="newPassword"
                />
              </Labeled>
              <Labeled label="새 비밀번호 확인">
                <TextInput
                  style={s.input}
                  value={newPw2}
                  onChangeText={setNewPw2}
                  placeholder="다시 입력"
                  secureTextEntry
                  textContentType="newPassword"
                />
              </Labeled>

              {/* 주소 */}
              <Text style={s.label}>주소</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[s.input, { height: INPUT_HEIGHT, textAlignVertical: 'center' }]}
                    placeholder="우편번호"
                    value={postcode}
                    onChangeText={setPostcode}
                    keyboardType="number-pad"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setAddrModal(true)}
                  style={[s.button, s.searchBtn]}
                >
                  <Text style={s.buttonText}>검색</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[s.input, { marginBottom: 8 }]}
                placeholder="도로명/지번 주소"
                value={address1}
                onChangeText={setAddress1}
              />
              <TextInput
                style={s.input}
                placeholder="상세 주소"
                value={address2}
                onChangeText={setAddress2}
              />
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
      </Modal>

      {/* 주소 검색 모달 */}
      <AddressSearchModal
        visible={addrModal}
        onClose={() => setAddrModal(false)}
        onComplete={(d) => {
          setPostcode(d.zonecode);
          setAddress1(d.address);
        }}
      />
    </>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlay: { position: 'absolute', inset: 0 as any },
  card: {
    width: '100%', maxWidth: 520, maxHeight: '88%',
    backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
  },
  header: {
    height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, borderBottomWidth: 1, borderColor: '#eee',
  },
  hBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  hBtnText: { fontSize: 16, color: '#111827' },
  hTitle: { fontSize: 16, fontWeight: '800' },

  label: { fontSize: 14, color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: Platform.select({ ios: 12, android: 10 }),
    fontSize: 16, backgroundColor: '#fff',
  },
  readonly: { backgroundColor: '#f3f4f6' },

  button: {
    backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  searchBtn: {
    height: INPUT_HEIGHT, paddingVertical: 0, paddingHorizontal: 16,
    justifyContent: 'center', borderRadius: 10, marginTop: 0,
  },
});
