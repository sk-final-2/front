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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { getProfile, setProfile, type Profile } from '../../src/lib/session';
import { clearTokens } from '../../src/lib/auth';
import { fetchMe, fetchMyPage, type MyPageResponse } from '../../src/lib/api';
import EditProfileModal from '../../components/EditProfileModal';
import ViewProfileModal from '../../components/ViewProfileModal';

// 안드로이드에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Home() {
  const r = useRouter();
  const [p, setP] = useState<Profile>(null);
  const [open, setOpen] = useState(false);

  // 마이페이지 데이터(모달에 바인딩)
  const [mp, setMp] = useState<MyPageResponse | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [modalKey, setModalKey] = useState(0);  // 리마운트용 키
  const bumpKey = () => setModalKey(k => k + 1);

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

  // 보기 팝업 열기
  async function openProfile() {
    try {
      const m = await fetchMyPage();
      setMp(m);
      bumpKey();
      setShowProfile(true);
    } catch (e: any) {
      Alert.alert('내 정보', e?.response?.data?.message || e?.message || '내 정보 로드 실패');
    }
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

  // 수정 팝업 열기
  async function openEdit() {
    try {
      // 보기에서 “프로필 수정” 눌렀을 때도 최신화
      const m = mp ?? (await fetchMyPage());
      setMp(m);
      bumpKey();
      setShowEdit(true);
    } catch (e: any) {
      Alert.alert('프로필 수정', e?.response?.data?.message || e?.message || '내 정보 로드 실패');
    }
  }

  function closeEdit() {
    setShowEdit(false);
  }

  // 저장 완료 시 홈 화면의 표시값도 갱신
  async function handleSaved(updated: MyPageResponse) {
    try {
      // ① 서버에서 최종 상태를 다시 한 번 받아와서 불확실한 필드를 보강
      const fresh = await fetchMyPage().catch(() => updated);

      // ② 기존 세션 스냅샷(다른 필드: role 등 유지)
      const base = (getProfile() as any) ?? {};

      // ③ name/email은 정의된 값만 덮어쓰기(undef/null이면 기존 값 유지)
      const merged = {
        ...base,
        name: (fresh?.name ?? updated?.name ?? base.name) ?? '',
        email: (fresh?.email ?? updated?.email ?? base.email) ?? '',
      };

      // ④ 화면/세션 동시 갱신
      setMp(fresh);
      setP(merged);
      setProfile(merged);

      // ⑤ 모달 닫기
      setShowEdit(false);

      Alert.alert('완료', '프로필이 수정되었습니다.');
    } catch (e: any) {
      // 실패해도 최소한 로컬 updated로 머지해서 화면이 비지 않게
      const base = (getProfile() as any) ?? {};
      const merged = {
        ...base,
        name: (updated?.name ?? base.name) ?? '',
        email: (updated?.email ?? base.email) ?? '',
      };
      setMp(updated);
      setP(merged);
      setProfile(merged);
      setShowEdit(false);
      Alert.alert('완료', '프로필이 수정되었습니다.(부분 갱신)');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.brand}>Recruit.AI</Text>
        {/* “내 정보 보기”를 누르면 보기 팝업 */}
        <Pressable style={styles.iconBtn} onPress={openProfile}>
          <Ionicons name="person-circle-outline" size={20} />
          <Text style={styles.iconBtnText}>내 정보 보기</Text>
        </Pressable>
      </View>

      {/* 환영 문구 */}
      <View style={{ gap: 6 }}>
        <Text style={styles.hello}>
          {p?.name ? `안녕하세요, ${p.name}님` : '안녕하세요!'}
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
          <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
            <Text style={styles.sectionTitle}>내 정보</Text>
            <Pressable
              onPress={openEdit}
              style={{ paddingHorizontal:12, paddingVertical:8, borderRadius:10, backgroundColor:'#111827' }}
            >
              <Text style={{ color:'#fff', fontWeight:'700' }}>프로필 수정</Text>
            </Pressable>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>이름</Text>
            <Text style={styles.value}>{(mp?.name ?? p?.name) ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>이메일</Text>
            <Text style={styles.value}>{(mp?.email ?? p?.email) ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>주소</Text>
            <Text style={styles.value}>
              {mp
                ? `${mp.postcode ? `[${mp.postcode}] ` : ''}${mp.address1 ?? ''}${mp.address2 ? ` ${mp.address2}` : ''}` || '-'
                : '-'}
            </Text>
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

      {/* 보기 팝업 */}
      <ViewProfileModal
        key={`info-${modalKey}`}
        visible={showProfile}
        profile={mp}
        onClose={() => setShowProfile(false)}
        onEdit={() => {
          setShowProfile(false);
          openEdit();
        }}
      />

      {/* 수정 팝업 */}
      <EditProfileModal
        key={`edit-${modalKey}`}
        visible={showEdit}
        profile={mp}                 // 처음엔 null → 로딩 후 채워짐
        onClose={() => setShowEdit(false)}
        onSaved={handleSaved}        // 저장 후 홈 상태/세션 업데이트 & 닫기
      />
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
