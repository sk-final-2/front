// mobile/app/(app)/index.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { getProfile, setProfile, type Profile } from '../../src/lib/session';
import { clearTokens } from '../../src/lib/auth';
import { fetchMe } from '../../src/lib/api';

// 안드로이드에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Home() {
  const r = useRouter();
  const [p, setP] = useState<Profile>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = getProfile();
    setP(current);
    if (!current) {
      // 새로고침 등으로 메모리 날아간 경우 /me 재조회
      fetchMe()
        .then((me) => {
          setProfile(me);
          setP(me);
        })
        .catch(() => {});
    }
  }, []);

  function toggleProfile() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  }

  async function onStartInterview() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    r.push('/(app)/interview'); // 인터뷰 화면으로 이동 (아래 2번 파일 추가)
  }

  async function onLogout() {
    await clearTokens();
    setProfile(null);
    r.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.brand}>Recruit.AI</Text>
        <Pressable style={styles.iconBtn} onPress={toggleProfile}>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} />
          <Text style={styles.iconBtnText}>{open ? '내 정보 숨기기' : '내 정보 보기'}</Text>
        </Pressable>
      </View>

      {/* 환영 문구 */}
      <View style={{ gap: 6 }}>
        <Text style={styles.hello}>
          {p ? `안녕하세요, ${p.name}님` : '안녕하세요!'}
        </Text>
        <Text style={styles.subtitle}>오늘도 좋은 면접 준비 해볼까요?</Text>
      </View>

      {/* CTA 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>가상 면접</Text>
        <Text style={styles.cardDesc}>실제처럼 연습하고, 피드백을 받아보세요.</Text>

        <Pressable style={styles.ctaBtn} onPress={onStartInterview}>
          <Ionicons name="play-circle" size={22} color="#fff" />
          <Text style={styles.ctaText}>가상면접 시작</Text>
        </Pressable>
      </View>

      {/* 접혀있는 유저 정보 */}
      {open && (
        <View style={styles.profileCard}>
          <Text style={styles.sectionTitle}>내 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>이름</Text>
            <Text style={styles.value}>{p?.name ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>이메일</Text>
            <Text style={styles.value}>{p?.email ?? '-'}</Text>
          </View>
        </View>
      )}

      {/* 하단 버튼들 */}
      <View style={styles.footer}>
        <Pressable style={styles.secondaryBtn} onPress={() => r.push('/(app)/history')}>
          <Ionicons name="time-outline" size={18} />
          <Text style={styles.secondaryText}>면접 기록</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} />
          <Text style={styles.secondaryText}>로그아웃</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 22, fontWeight: '800' },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6 },
  iconBtnText: { fontSize: 13 },

  hello: { fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#666' },

  card: {
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardDesc: { color: '#bbb' },
  ctaBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  profileCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: '#666' },
  value: { fontWeight: '600' },

  footer: { marginTop: 'auto', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondaryText: { fontWeight: '600' },
});
