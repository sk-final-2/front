// mobile/app/(app)/index.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  Alert,
  Animated,
  Image,
  ScrollView,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { getProfile, setProfile, type Profile } from '../../src/lib/session';
import { clearTokens } from '../../src/lib/auth';
import { fetchMe, fetchMyPage, type MyPageResponse, type AvgScore, 
  fetchInterviewHistory,
  type Interview,
  type AnswerAnalysis, } from '../../src/lib/api';
import EditProfileModal from '../../components/EditProfileModal';
import ViewProfileModal from '../../components/ViewProfileModal';
import FadeSlideInText from '../../components/FadeSlideInText';

// 안드로이드에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// "2025년 08월 19일 17:32:42" 파싱
function parseKoreanDateString(s: string): Date | null {
  const m = s?.trim().match(
    /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!m) return null;
  const [, yy, MM, dd, hh, mm, ss] = m;
  const d = new Date(Number(yy), Number(MM) - 1, Number(dd), Number(hh), Number(mm), ss ? Number(ss) : 0);
  return isNaN(d.getTime()) ? null : d;
}
const toMs = (v?: string) => (parseKoreanDateString(v || '')?.getTime() ?? 0);

// 평균 유틸
const mean = (arr: Array<number | undefined>) => {
  const v = arr.map(Number).filter((n) => !isNaN(n));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
};

// answerAnalyses → AvgScore 산출
function avgFromAnalyses(list: AnswerAnalysis[]): AvgScore {
  return {
    score: Math.round(mean(list.map(x => x.score))),
    emotionScore: Math.round(mean(list.map(x => x.emotionScore))),
    blinkScore: Math.round(mean(list.map(x => x.blinkScore))),
    eyeScore: Math.round(mean(list.map(x => x.eyeScore))),
    headScore: Math.round(mean(list.map(x => x.headScore))),
    handScore: Math.round(mean(list.map(x => x.handScore))),
  };
}

// 0~1 스케일이면 0~100으로 보정
function normalizeScale(scores: AvgScore): AvgScore {
  const vals = Object.values(scores);
  const looksZeroToOne = vals.every(n => n >= 0 && n <= 1.001);
  const s = looksZeroToOne ? 100 : 1;
  return {
    score: Math.round((scores.score ?? 0) * s),
    emotionScore: Math.round((scores.emotionScore ?? 0) * s),
    blinkScore: Math.round((scores.blinkScore ?? 0) * s),
    eyeScore: Math.round((scores.eyeScore ?? 0) * s),
    headScore: Math.round((scores.headScore ?? 0) * s),
    handScore: Math.round((scores.handScore ?? 0) * s),
  };
}


const EMOJIS: Record<keyof AvgScore, string> = {
  score: '⭐',
  emotionScore: '😊',
  blinkScore: '🙈',
  eyeScore: '👀',
  headScore: '🤔',
  handScore: '✋',
};

const LABELS: Record<keyof AvgScore, string> = {
  score: '종합',
  emotionScore: '감정',
  blinkScore: '눈 깜빡임',
  eyeScore: '시선 처리',
  headScore: '고개 움직임',
  handScore: '손 움직임',
};

function ScoreSummary({ data }: { data: AvgScore }) {
  // 최고 점수 항목 찾기 (score 제외)
  const entries = (Object.keys(data) as (keyof AvgScore)[]).filter(k => k !== 'score');
  const bestKey = entries.reduce((a, b) => (data[a] > data[b] ? a : b), entries[0]);

  return (
    <View style={ss.container}>
      {/* 로봇 말풍선 */}
      <View style={ss.bubbleWrap}>
        <Text style={ss.robot}>🤖</Text>
        <View style={ss.bubble}>
          <Text style={ss.bubbleText}>
            이번 면접, {LABELS[bestKey]} 안정성이 최고였네요! (평균 {Math.round(data.score)}점)
          </Text>
        </View>
      </View>

      {/* 점수 바 모음 */}
      <View style={ss.barWrap}>
        {entries.map((k) => (
          <View key={k} style={ss.barItem}>
            {/* 라벨 + 점수 한 줄 */}
            <View style={ss.barHeader}>
              <Text style={ss.barLabel}>
                {EMOJIS[k]} {LABELS[k]}
              </Text>
              <Text style={ss.barScore}>{Math.round(data[k])}점</Text>
            </View>
            <View style={ss.progressBg}>
              <View
                style={[
                  ss.progressFill,
                  {
                    width: `${Math.min(Math.round(data[k]), 100)}%`,
                    backgroundColor:
                      data[k] >= 80 ? '#4ade80' : //초록 (좋음)
                      data[k] >= 60 ? '#facc15' : //노랑 (보통)
                      '#f87171', //빨강 (낮음)
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

    </View>
  );
}

// ScoreSummary 전용 스타일
const ss = StyleSheet.create({
  container: { gap: 12, padding: 12, backgroundColor: '#fff', borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  robot: { fontSize: 28 },
  bubble: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  bubbleText: { color: '#111827', fontWeight: '600' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { backgroundColor: '#eef2ff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontWeight: '700', color: '#111827' },

  barWrap: { gap: 10, marginTop: 8 },
  barItem: { gap: 4 },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: { fontWeight: '600', color: '#111827' },
  barScore: { fontWeight: '700', color: '#374151' },
  progressBg: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
});

export default function Home() {
  const r = useRouter();
  const [p, setP] = useState<Profile>(null);
  const [open, setOpen] = useState(false);
  const [imgReady, setImgReady] = useState(false);

  // 마이페이지 데이터(모달에 바인딩)
  const [mp, setMp] = useState<MyPageResponse | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [modalKey, setModalKey] = useState(0);  // 리마운트용 키
  const bumpKey = () => setModalKey(k => k + 1);

  //애니메이션
  const [playKey, setPlayKey] = useState(0);
  const robotScale = React.useRef(new Animated.Value(1)).current;

  //평균 점수
  const [summaryScore, setSummaryScore] = useState<AvgScore | null>(null);

  //로고 애니메이션
  const [animKey, setAnimKey] = useState(0);

  const replay = () => {
    // 1) 로봇 탭 반응
    Animated.sequence([
      Animated.spring(robotScale, { toValue: 1.08, useNativeDriver: true, friction: 6, tension: 120 }),
      Animated.spring(robotScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }),
    ]).start();

    // 2) 리스트 애니메이션 재생
    setPlayKey(k => k + 1);
  };

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

  useEffect(() => {
    (async () => {
      try {
        const history = await fetchInterviewHistory();
        if (!history?.length) return;

        // 최신순 정렬 후 1건 선택
        const latest = [...history].sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))[0];

        let s: AvgScore | null = null;
        // 1) 백엔드가 avgScore를 채워줄 때
        if (latest.avgScore?.length) {
          s = latest.avgScore[0];
        }
        // 2) 없으면 answerAnalyses로 직접 평균 계산
        else if (latest.answerAnalyses?.length) {
          s = avgFromAnalyses(latest.answerAnalyses);
        }

        if (s) setSummaryScore(normalizeScale(s));
      } catch (e) {
        // 무시 (요약카드만 숨김)
      }
    })();
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

  // 순차 등장용 아이템
  type Feature = { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string };

  const FEATURES: Feature[] = [
    { icon: 'flash-outline', title: '실시간 피드백', desc: '종합적인 분석 및 피드백 제공' },
    { icon: 'help-circle-outline', title: '맞춤형 질문', desc: '직무/레벨에 맞춘 예상 질문 생성' },
    { icon: 'albums-outline', title: '다양한 면접 유형', desc: '다양한 시나리오 제공' },
    { icon: 'analytics-outline', title: '결과 분석 리포트', desc: '강점과 약점 상세 리포트 제공' },
  ];

  function FeatureItem({
    item,
    delay = 0,
    playKey = 0,
  }: { item: Feature; delay?: number; playKey?: number }) {
    const opacity = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(12)).current;

    useEffect(() => {
      // ⬇️ 재생 전 값 초기화
      opacity.setValue(0);
      translateY.setValue(12);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
      ]).start();
    }, [delay, playKey, opacity, translateY]);

    return (
      <Animated.View style={[styles.featureRow, { opacity, transform: [{ translateY }] }]}>
        <View style={styles.featureIcon}>
          <Ionicons name={item.icon} size={18} color="#111827" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureDesc}>{item.desc}</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 40, gap: 16 }} // 내용 전체를 스크롤 가능하게
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={() => setAnimKey(k => k + 1)}
        onMomentumScrollEnd={() => setAnimKey(k => k + 1)}
      >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          <Text style={[styles.brand, { fontFamily: 'RubikGlitch' }]}>Re:AI</Text>
            {/* ▼ 애니메이션 태그라인 */}
            <View style={{ marginLeft: 8, marginBottom: -2 }}>
              <FadeSlideInText triggerKey={animKey} delay={150} style={[styles.taglineSecondary, { fontFamily: 'RubikGlitch' }]}>
                Rehearse with AI
              </FadeSlideInText>
              <FadeSlideInText triggerKey={animKey} delay={350} style={[styles.tagline, { fontFamily: 'RubikGlitch' }]}>
                Reinforce with AI
              </FadeSlideInText>
            </View>
          </View>
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

      {/* 기능 하이라이트 섹션 (로봇 + 애니메이션 리스트) */}
      <View style={styles.hero}>
        <Pressable onPress={replay} hitSlop={8}>
          <Animated.Image
            source={require('../../assets/images/robot.png')}
            style={[styles.robot, { transform: [{ scale: robotScale }] }]}
            resizeMode="contain"
          />
        </Pressable>

        <View style={{ flex: 1 }}>
          {FEATURES.map((f, i) => (
            <FeatureItem key={f.title} item={f} delay={i * 140} playKey={playKey} />
          ))}
        </View>
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

      {/* ✅ 요약 카드 (실데이터로) */}
      {summaryScore && <ScoreSummary data={summaryScore} />}

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
      </Animated.ScrollView>
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

  hero: {
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  robot: {
    width: 92,
    height: 92,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTitle: { fontWeight: '800', color: '#111827' },
  featureDesc: { color: '#6b7280', marginTop: 2, lineHeight: 18 },

  tagline: { fontSize: 14, fontWeight: '700', color: '#4f46e5' },
  taglineSecondary: { fontSize: 14, fontWeight: '700', color: '#393a3cff', opacity: 0.85 },
});
