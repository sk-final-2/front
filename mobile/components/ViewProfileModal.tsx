import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { type MyPageResponse, deleteMyAccount } from '../src/lib/api';
import { router } from 'expo-router';

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

  //수정일 포맷터
  const fmtKorean = (ts?: string | null) => {
    if (!ts) return '-';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}년 ${pad(d.getMonth() + 1)}월 ${pad(d.getDate())}일 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const onPressDelete = () => {
    Alert.alert(
      '계정 탈퇴',
      '정말 탈퇴하시겠습니까?\n탈퇴 후 모든 데이터가 손실됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              const msg = await deleteMyAccount(); // "계정이 삭제되었습니다"
              Alert.alert('알림', msg);
              onClose(); // 모달 닫기
              router.replace('/login');
            } catch (e: any) {
              Alert.alert('오류', e?.message ?? '탈퇴 중 오류가 발생했어.');
            }
          },
        },
      ]
    );
  };

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
            <Row label="수정일" value={fmtKorean(profile?.updatedAt)} />
          </ScrollView>

          {/* ✅ 하단 액션 */}
          <View style={s.footer}>
            <TouchableOpacity onPress={onPressDelete} style={s.deleteBtn}>
              <Text style={s.deleteText}>계정 탈퇴</Text>
            </TouchableOpacity>
          </View>
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

  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 15,
  },
});
