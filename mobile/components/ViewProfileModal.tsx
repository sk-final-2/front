import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { MyPageResponse } from '../src/lib/api';

export default function ViewProfileModal({
  visible,
  profile,
  onClose,
  onEdit,
}: {
  visible: boolean;
  profile: MyPageResponse | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <Pressable style={s.overlay} onPress={onClose} />
        <View style={s.card}>
          {/* 헤더 */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.hBtn}>
              <Text style={s.hBtnText}>닫기</Text>
            </TouchableOpacity>
            <Text style={s.hTitle}>내 정보</Text>
            <TouchableOpacity onPress={onEdit} style={s.hBtn}>
              <Text style={[s.hBtnText, { color: '#2563eb', fontWeight: '800' }]}>
                수정
              </Text>
            </TouchableOpacity>
          </View>

          {/* 내용 */}
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <Row label="이메일" value={profile?.email ?? '-'} />
            <Row label="이름" value={profile?.name ?? '-'} />
            <Row label="성별" value={profile?.gender ?? '-'} />
            <Row label="생년월일" value={profile?.birth ?? '-'} />
            <Row
              label="주소"
              value={
                profile
                  ? `${profile.postcode ? `[${profile.postcode}] ` : ''}${profile.address1 ?? ''}${profile.address2 ? ` ${profile.address2}` : ''}` || '-'
                  : '-'
              }
            />
            <Row label="가입일" value={profile?.createdAt ? String(profile.createdAt) : '-'} />
            <Row label="수정일" value={profile?.updatedAt ? String(profile.updatedAt) : '-'} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value || '-'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlay: { position: 'absolute', inset: 0 as any },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  hBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  hBtnText: { fontSize: 16, color: '#111827' },
  hTitle: { fontSize: 16, fontWeight: '800' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  label: { color: '#6b7280' },
  value: { color: '#111827', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});
