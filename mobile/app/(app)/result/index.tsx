import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Svg, { G, Polygon, Line, Circle, Text as SvgText, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { getResult } from '../../../src/lib/resultCache';
import { getAccessToken } from '../../../src/lib/auth';
import FadeSlideInText from '../../../components/FadeSlideInText';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { API_BASE } = (Constants.expoConfig?.extra ?? {}) as any;

function mediaUrl(interviewId: string | number, seq: number) {
  const u = new URL('/api/interview/media', API_BASE);
  u.searchParams.set('interviewId', String(interviewId));
  u.searchParams.set('seq', String(seq));
  return u.toString();
}

type TS = { time: string; reason: string };
type AnswerAnalysis = {
  seq: number;
  question: string;
  answer: string;
  good: string;
  bad: string;
  score: number;
  emotionText?: string;
  mediapipeText?: string;
  emotionScore: number;
  blinkScore?: number;
  eyeScore?: number;
  headScore?: number;
  handScore?: number;
  timestamp?: TS[];
};

type ResultData = {
  uuid: string;
  memberId: number;
  createdAt: string;
  job: string;
  career: string;
  type: string;
  level: string;
  language: string;
  count: number;
  answerAnalyses: AnswerAnalysis[];
  avgScore?: { score: number; emotionScore: number; blinkScore: number; eyeScore: number; headScore: number; handScore: number }[];
};

const THEME = {
  primary: '#111827',
  text: '#111827',
  muted: '#6b7280',
  bg: '#f8fafc',
  white: '#fff',
  border: '#e5e7eb',
  radius: 12,
  track: '#e5e7eb',
  fill: '#111827',
  ok: '#10b981',
};

const screenW = Dimensions.get('window').width;

const mmssToSec = (s: string) => {
  const [m, sec] = s.split(':').map(n => +n || 0);
  return m * 60 + sec;
};

// 초 → "MM:SS"
const secToMmss = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// 5초 버킷으로 그룹핑
function groupViolations(timestamps: TS[] = [], bucketSec = 5) {
  const map = new Map<number, { start: number; end: number; counts: Record<string, number> }>();

  for (const { time, reason } of timestamps) {
    const sec = mmssToSec(time);
    const start = Math.floor(sec / bucketSec) * bucketSec;
    const end = start + bucketSec;

    if (!map.has(start)) map.set(start, { start, end, counts: {} });
    const g = map.get(start)!;
    g.counts[reason] = (g.counts[reason] || 0) + 1;
  }

  return Array.from(map.values()).sort((a, b) => a.start - b.start);
}

// "시선 처리 3, 손 움직임 1" 형태로 출력
function countsToString(counts: Record<string, number>) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1]) // 많이 나온 순
    .map(([reason, cnt]) => `${reason} ${cnt}회`)
    .join(', ');
}

// 안전 숫자 변환
const toNum = (v: any, def = 0) => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : def;
};
// 점수 표시용
const fmtScore = (v: any) => {
  const n = toNum(v, NaN);
  return Number.isFinite(n) ? n.toFixed(1) : '-';
};

// 등급 뱃지 색상 팔레트
function getGrade(score: number) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  if (s >= 90) return { grade: 'A', color: '#10b981', tint: 'rgba(16,185,129,0.10)', border: '#10b981' };
  if (s >= 80) return { grade: 'B', color: '#0ea5e9', tint: 'rgba(14,165,233,0.10)', border: '#0ea5e9' };
  if (s >= 70) return { grade: 'C', color: '#f59e0b', tint: 'rgba(245,158,11,0.10)', border: '#f59e0b' };
  if (s >= 60) return { grade: 'D', color: '#f97316', tint: 'rgba(249,115,22,0.10)', border: '#f97316' };
  return { grade: 'F', color: '#ef4444', tint: 'rgba(239,68,68,0.10)', border: '#ef4444' };
}

// 점수 뱃지 색상 팔레트
function getScoreBadgeStyle(score: number) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  if (s >= 90) return { color: '#059669', border: '#60a991ff' };
  if (s >= 80) return { color: '#0284c7', border: '#3baae1ff' };
  if (s >= 70) return { color: '#ffd220ff', border: '#fde68a' };
  if (s >= 60) return { color: '#ff8800ff', border: '#f79e3fff' };
  return { color: '#bf1b1bff', border: '#d87575ff' };
}

// 문제 번호에 대한 내 점수도 추가
const CAT_LABELS = ['감정', '눈 깜빡임', '시선 처리', '고개 움직임', '손 움직임'] as const;

function byCatFromAnalysis(a: AnswerAnalysis | undefined) {
  if (!a) {
    return CAT_LABELS.map(label => ({ label, value: 0 }));
  }
  return [
    { label: '감정',       value: toNum(a.emotionScore) },
    { label: '눈 깜빡임', value: toNum(a.blinkScore) },
    { label: '시선 처리', value: toNum(a.eyeScore) },
    { label: '고개 움직임', value: toNum(a.headScore) },
    { label: '손 움직임',   value: toNum(a.handScore) },
  ];
}

function avgByCatFromAnalyses(arr: AnswerAnalysis[] = []) {
  if (!arr.length) return CAT_LABELS.map(label => ({ label, value: 0 }));
  const sum = { emotion:0, blink:0, eye:0, head:0, hand:0 };
  arr.forEach(a => {
    sum.emotion += toNum(a.emotionScore);
    sum.blink   += toNum(a.blinkScore);
    sum.eye     += toNum(a.eyeScore);
    sum.head    += toNum(a.headScore);
    sum.hand    += toNum(a.handScore);
  });
  const n = arr.length || 1;
  return [
    { label: '감정',       value: sum.emotion / n },
    { label: '눈 깜빡임', value: sum.blink   / n },
    { label: '시선 처리', value: sum.eye     / n },
    { label: '고개 움직임', value: sum.head    / n },
    { label: '손 움직임',   value: sum.hand    / n },
  ];
}

export default function ResultScreen() {
  const r = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const timeBySeqRef = useRef<Record<number, number>>({});

  // 캐시에서 결과 꺼내기 (id가 있으면 해당 결과, 없으면 마지막 결과)
  const result = useMemo(() => getResult(id?.toString()), [id]) as ResultData | undefined;

  // 캐시에 없을 때 안전 처리
  if (!result) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
        <Text style={{ marginBottom:12 }}>결과 데이터를 찾을 수 없어요.</Text>
        <TouchableOpacity
          onPress={() => r.replace('/')}
          style={{ paddingHorizontal:16, paddingVertical:10, backgroundColor:'#111827', borderRadius:10 }}
        >
          <Text style={{ color:'#fff', fontWeight:'700' }}>홈으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //로고 애니메이션
  const [animKey, setAnimKey] = useState(0);

  // 2) 평균(또는 문항별 평균) 계산
  const overall = useMemo(() => {
    const avg = result.avgScore?.[0];
    if (avg) {
      return {
        byCat: [
          { label: '감정',   value: toNum(avg.emotionScore) },
          { label: '눈 깜빡임', value: toNum(avg.blinkScore) },
          { label: '시선 처리',   value: toNum(avg.eyeScore) },
          { label: '고개 움직임',   value: toNum(avg.headScore) },
          { label: '손 움직임',     value: toNum(avg.handScore) },
        ],
      };
    }
    const n = result.answerAnalyses.length || 1;
    const sum = { emotion:0, blink:0, eye:0, head:0, hand:0 };
    result.answerAnalyses.forEach(a => {
      sum.emotion += toNum(a.emotionScore);
      sum.blink   += toNum(a.blinkScore);
      sum.eye     += toNum(a.eyeScore);
      sum.head    += toNum(a.headScore);
      sum.hand    += toNum(a.handScore);
    });
    return {
      byCat: [
        { label: '감정',   value: sum.emotion / n },
        { label: '눈 깜빡임', value: sum.blink   / n },
        { label: '시선 처리',   value: sum.eye     / n },
        { label: '고개 움직임',   value: sum.head    / n },
        { label: '손 움직임',     value: sum.hand    / n },
      ],
    };
  }, [result]);

  // 3) 질문 탭/현재 질문
  const [idx, setIdx] = useState(0);
  const [reloadTick, setReloadTick] = useState(0);
  const current = result.answerAnalyses[Math.min(idx, result.answerAnalyses.length - 1)];
  const playerRef = useRef<any>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 4) 현재 문항에 대한 내 점수
  const myCurByCat = useMemo(() => byCatFromAnalysis(current), [current]);
  // 전체 평균(동일 구조)
  const peerByCat = overall.byCat.map(c => ({ label: c.label, value: toNum(c.value) }));

  // 카테고리별 비교 데이터 생성
  const compareItems = CAT_LABELS.map(label => {
    const peer = toNum(peerByCat.find(x => x.label === label)?.value);
    const mine = toNum(myCurByCat.find(x => x.label === label)?.value);
    return { label, peer, mine, diff: mine - peer };
  });

  const onPressTs = (ts: string) => {
    const p = playerRef.current;
    if (!p) return;
    p.currentTime = mmssToSec(ts);
    p.play?.();
  };

  function playSegment(startSec: number, endSec: number) {
    const p = playerRef.current;
    if (!p) return;

    // 이전 타이머 정리
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    // 구간 재생
    p.currentTime = startSec;
    p.play?.();

    const durMs = Math.max(0, (endSec - startSec) * 1000);
    stopTimerRef.current = setTimeout(() => {
      playerRef.current?.pause?.();
    }, durMs);
  }

  function formatMediapipeText(text: string) {
    return text
      .split(/(?=눈 깜빡임 감지 분석 결과|시선처리 감지 분석 결과|고개 각도 감지 분석 결과|손 움직임 감지 분석 결과)/)
      .map(t => t.trim())
      .filter(Boolean);
  }

  function PenaltyPoints({
    timestamps,
    bucketSec = 5,
    multiThreshold = 1,
    onPlaySegment,
  }: {
    timestamps: TS[] | undefined;
    bucketSec?: number;              // 5초 버킷
    multiThreshold?: number;         // 복수 감지 기준(총 횟수 >= N)
    onPlaySegment: (start: number, end: number) => void;
  }) {
    const [mode, setMode] = useState<'all' | 'multi'>('all');

    const segments = useMemo(() => groupViolations(timestamps ?? [], bucketSec), [timestamps, bucketSec]);

    const filtered = useMemo(() => {
      if (mode === 'all') return segments;
      // 복수 감지만: 해당 버킷에서 총 감지 횟수의 합이 threshold 이상
      return segments.filter(seg => Object.values(seg.counts).reduce((a, b) => a + b, 0) >= multiThreshold);
    }, [segments, mode, multiThreshold]);

     // multi 모드에서 '복수 감지'가 발생한 버킷 시작초 집합
  const multiBuckets = useMemo(() => {
    const set = new Set<number>();
    segments.forEach(seg => {
      const total = Object.values(seg.counts).reduce((a, b) => a + b, 0);
      if (total >= multiThreshold) set.add(seg.start);
    });
    return set;
  }, [segments, multiThreshold]);

  // ALL 모드: 기존처럼 구간 칩
  const allView = (
    <View style={styles.chipsWrap}>
      {segments.map((seg) => (
        <TouchableOpacity
          key={`all-${seg.start}`}
          onPress={() => onPlaySegment(seg.start, seg.end)}
          style={styles.tsChip}
        >
          <Text style={styles.tsChipTime}>
            {secToMmss(seg.start)}~{secToMmss(seg.end)}
          </Text>
          <Text style={styles.tsChipReason}> · {countsToString(seg.counts)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // MULTI 모드: 해당 버킷에 속한 '개별 감지 시각'만 칩으로 표기
  const MULTI_PREVIEW_SEC = 3; // 시점부터 3초만 재생

  const multiGrouped = useMemo(() => {
    if (!timestamps?.length) return [];
    const map = new Map<number, string[]>();

    for (const { time, reason } of timestamps) {
      const sec = mmssToSec(time);
      const bucketStart = Math.floor(sec / bucketSec) * bucketSec;
      if (multiBuckets.has(bucketStart)) {
        if (!map.has(sec)) map.set(sec, []);
        map.get(sec)!.push(reason);
      }
    }

    return Array.from(map.entries())
      .map(([sec, reasons]) => ({ sec, reasons }))
      .sort((a, b) => a.sec - b.sec);
  }, [timestamps, multiBuckets, bucketSec]);

  const multiView = multiGrouped.length ? (
    <View style={styles.tsWrap}>
      {multiGrouped.map(({ sec, reasons }) => (
        <TouchableOpacity
          key={`multi-${sec}`}
          onPress={() => onPlaySegment(sec, sec + MULTI_PREVIEW_SEC)}
          style={styles.tsChipInline}
          activeOpacity={0.85}
        >
          <Text style={styles.tsChipTime}>{secToMmss(sec)}</Text>
          <Text style={styles.tsChipReason}> · {reasons.join(', ')}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ) : (
    <Text style={[styles.kvKey, { marginTop: 6 }]}>복수로 감지된 시각이 없어요.</Text>
  );

    return (
      <View style={[styles.card, { marginTop: 12 }]}>
        {/* 헤더
         + 토글 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
            <AntDesign name="warning" size={20} color="#ef4444" style={{ marginTop: -8 }}/>
            <Text style={styles.sectionTitle}>감점 포인트</Text>
          </View>

          {/* 토글 (pill) */}
          <View style={styles.toggleWrap}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'all' && styles.toggleBtnActive]}
              onPress={() => setMode('all')}
            >
              <Text style={[styles.toggleText, mode === 'all' && styles.toggleTextActive]}>구간 별</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'multi' && styles.toggleBtnActive]}
              onPress={() => setMode('multi')}
            >
              <Text style={[styles.toggleText, mode === 'multi' && styles.toggleTextActive]}>시간 별</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 본문 */}
        {mode === 'all' ? allView : multiView}
      </View>
    );
  }

  // 만점 메달 섹션
  function PerfectMedals({
    scores,
  }: {
    scores: { emotion?: number; blink?: number; eye?: number; head?: number; hand?: number };
  }) {
    const items = [
      { key: 'emotion', label: '감정',       icon: <MaterialCommunityIcons name="emoticon" size={14} color="#fff" /> },
      { key: 'blink',   label: '눈 깜빡임',   icon: <Ionicons name="eye" size={14} color="#fff" /> },
      { key: 'eye',     label: '시선 처리',       icon: <Ionicons name="trail-sign-outline" size={14} color="#fff" /> },
      { key: 'head',    label: '고개 움직임',       icon: <MaterialCommunityIcons name="head" size={14} color="#fff" /> },
      { key: 'hand',    label: '손 움직임',         icon: <MaterialIcons name="back-hand" size={14} color="#fff" /> },
    ] as const;

    const perfects = items.filter(it => Math.round(scores[it.key as keyof typeof scores] ?? 0) === 100);

    return (
      <View style={{ gap: 8, marginTop: -10 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
          <FontAwesome name="trophy" size={18} color="#f59e0b" />
          <Text style={{ fontSize: 13, fontWeight: '800', color:'#111827' }}>만점 메달</Text>
        </View>

        {perfects.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={medals.row}
          >
            {perfects.map(it => (
              <MedalBadge key={it.key} label={it.label}>
                {it.icon}
              </MedalBadge>
            ))}
          </ScrollView>
        ) : (
          <Text style={{ fontSize:12, color:'#6b7280' }}>
            이번엔 만점 항목이 없어요. 다음엔 노려봐요!
          </Text>
        )}
      </View>
    );
  }


  return (
    <Animated.ScrollView style={{ flex: 1, backgroundColor: THEME.bg }} 
        contentContainerStyle={{ padding: 16, paddingTop: 50, paddingBottom: 40 }}
        onScrollEndDrag={() => setAnimKey(k => k + 1)}
        onMomentumScrollEnd={() => setAnimKey(k => k + 1)}
      >
      <View style={ss.header}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              {/* 브랜드 */}
              <Text style={[ss.brand, { fontFamily: 'RubikGlitch' }]}>Re:AI</Text>

              {/* 애니메이션 태그라인 */}
              <View style={{ marginLeft: 8, marginBottom: -2 }}>
                <FadeSlideInText
                  triggerKey={animKey}
                  delay={150}
                  style={[ss.taglineSecondary, { fontFamily: 'RubikGlitch' }]}
                >
                  Rehearse with AI
                </FadeSlideInText>
                <FadeSlideInText
                  triggerKey={animKey}
                  delay={350}
                  style={[ss.tagline, { fontFamily: 'RubikGlitch' }]}
                >
                  Reinforce with AI
                </FadeSlideInText>
              </View>
            </View>
      {/* 면접 결과 카드 */}
      <View style={[styles.card, { marginTop: 12, marginBottom: 10, paddingVertical: 20 }]}>
        <Text style={[styles.title, { marginBottom: 12 }]}>면접 정보</Text>

        <View style={styles.resultRow}>
          <Ionicons name="briefcase-outline" size={16} color="#3B82F6" />
          <Text style={styles.meta}>직무: {result.job}</Text>
        </View>

        <View style={styles.resultRow}>
          <Ionicons name="person-outline" size={16} color="#3B82F6" />
          <Text style={styles.meta}>경력: {result.career}</Text>
        </View>

        <View style={styles.resultRow}>
          <Ionicons name="grid-outline" size={16} color="#3B82F6" />
          <Text style={styles.meta}>면접 타입: {result.type}</Text>
        </View>

        <View style={styles.resultRow}>
          <Ionicons name="star-outline" size={16} color="#3B82F6" />
          <Text style={styles.meta}>레벨: {result.level}</Text>
        </View>

        <View style={styles.resultRow}>
          <Ionicons name="language-outline" size={16} color="#3B82F6" />
          <Text style={styles.meta}>언어: {result.language}</Text>
        </View>

        <View style={[styles.resultRow]}>
          <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
          <Text style={styles.meta}>면접 일시: {result.createdAt}</Text>
        </View>
      </View>
      </View>
      {/* 상단 질문 번호 탭 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {result.answerAnalyses.map((a, i) => (
          <TouchableOpacity
            key={a.seq}
            onPress={() => {
              if (idx !== i) {
                setIdx(i);
                setReloadTick(t => t + 1); // 되돌아와도 매번 새로운 key 보장
              }
            }}
            style={[styles.tab, i === idx && styles.tabActive]}
          >
            <Text style={[styles.tabText, i === idx && styles.tabTextActive]}>{a.seq}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 현재 질문 제목/요약 */}
      <View style={[styles.card, { marginTop: 12 }]}>
        {/* 상단: 질문 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Text style={styles.title}>면접 결과</Text>
        </View>
        <View style={styles.resultRow}>
          <AntDesign name="questioncircleo" size={20} color="#3B82F6" style={{ marginTop: -10 }}/>
          <Text style={styles.meta}>질문 {current.seq}. {current.question}</Text>
        </View>

        {/* 하단: 점수/등급 뱃지 2개 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          {(() => {
            const { grade, color, tint, border } = getGrade(toNum(current.score));
            const scoreStyle = getScoreBadgeStyle(toNum(current.score));

            return (
              <>
                {/* 점수 뱃지 (파스텔) */}
                <View style={[styles.Badge, { borderColor: scoreStyle.border, backgroundColor: tint }]}>
                  <Text style={[styles.BadgeText, { color: scoreStyle.color }]}>
                    {Math.round(current.score)}
                  </Text>
                </View>
                <Text style={[styles.scoreLabel, { marginLeft: 6 }]}>점수</Text>

                {/* 구분점 */}
                <View style={[styles.dotDivider, { marginHorizontal: 10 }]} />

                {/* 등급 뱃지 (진한색) */}
                <View style={[styles.Badge, { borderColor: border, backgroundColor: tint }]}>
                  <Text style={[styles.BadgeText, { color }]}>{grade}</Text>
                </View>
                <Text style={[styles.scoreLabel, { marginLeft: 6 }]}>등급</Text>
              </>
            );
          })()}
        </View>
      </View>

      {/* 영상 + 타임스탬프 */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:8 }}>
          <MaterialCommunityIcons name="video-vintage" size={20} color="#3B82F6" style={{ marginTop: -8 }}/>
          <Text style={styles.sectionTitle}>질문 {current.seq} 답변 영상</Text>
        </View>

        <View style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
          {id ? (
            <>
              {(() => {
                const videoHeight = Math.round((screenW - 32) * 9 / 16);
                const cacheBuster = reloadTick;
                const videoUri = `${mediaUrl(id, current.seq)}&cb=${cacheBuster}`;
                return (
                  <QuestionVideo
                    key={`${id}-${current.seq}-${reloadTick}`}   // 항상 리마운트
                    uri={videoUri}
                    headers={{ Authorization: `Bearer ${getAccessToken() || ''}` }}
                    height={videoHeight}
                    onPlayer={(p) => { playerRef.current = p; }}
                  />
                );
              })()}
            </>
          ) : (
            <View
              style={{
                width: '100%',
                height: Math.round((screenW - 32) * 9 / 16),
                backgroundColor: '#e5e7eb',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: THEME.muted }}>영상 URL 없음</Text>
            </View>
          )}
        </View>
      </View>

        {/* 감점 포인트 타임스탬프 */}
        {current.timestamp?.length ? (
          <PenaltyPoints
            timestamps={current.timestamp}
            bucketSec={5}                // 필요시 10/15로 변경 가능
            multiThreshold={1}           // 복수 감지 기준
            onPlaySegment={(s, e) => playSegment(s, e)}
          />
        ) : null}

      {/* 상세 정보 */}
      <View style={[styles.card, { marginTop: 12, gap: 10 }]}>
        <Text style={styles.sectionTitle}>자세한 정보</Text>
        <KV k={
          <Text style={styles.kvKey}>
          <MaterialCommunityIcons name="robot-happy" size={20} color="#10b981" />
            긍정 피드백
          </Text>
        } v={current.good} />
        <KV k={
          <Text style={styles.kvKey}>
            <MaterialCommunityIcons name="robot-confused" size={20} color="#f97316" />
            아쉬운 점
          </Text>
        } v={current.bad} />
        {current.emotionText ? (
          <KV k={
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <MaterialCommunityIcons name="emoticon" size={20} color="#f59e0b" />
                <Text style={[styles.kvKey]}>
                  감정 분석
                </Text>
            </View>
        } v={current.emotionText} />
        ) : null}
        {current.mediapipeText ? (
          <KV
            k={
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <MaterialIcons name="accessibility" size={20} color="#3b82f6" style={{ marginTop: 4 }}/>
                <Text style={[styles.kvKey]}>
                  동작 분석
                </Text>
              </View>
            }
            v={
              <Text style={styles.kvVal}>
                {formatMediapipeText(current.mediapipeText).map((line, i) => (
                  <Text key={i}>
                    • {line}
                    {'\n'}
                  </Text>
                ))}
              </Text>
            }
          />
        ) : null}

        {/* 만점 메달 영역 */}
        <PerfectMedals
          scores={{
            emotion: current.emotionScore,
            blink: current.blinkScore,
            eye: current.eyeScore,
            head: current.headScore,
            hand: current.handScore,
          }}
        />
      </View>

      {/* 평균 점수 (오각형 레이더) */}
      <View style={[styles.card, { marginTop: 10, alignItems: 'center' }]}>
        <Text style={styles.sectionTitle}>- {result.job}의 평균 점수 - </Text>

        {(() => {
          const peerVals = peerByCat.map(d => toNum(d.value));

          return (
            <RadarChart
              key={`radar-${idx}-${reloadTick}`}
              labels={CAT_LABELS as unknown as string[]}
              series={[
                // 전체 평균
                {
                  name: '전체 평균',
                  values: peerByCat.map(d => toNum(d.value)),
                  stroke: '#3b83f65d',
                  fill: 'rgba(59,130,246,0.18)',
                  strokeWidth: 2.5,
                },
                // 현재 문항 내 점수
                {
                  name: '내 점수(문항)',
                  values: myCurByCat.map(d => toNum(d.value)),
                  stroke: '#ff000057',
                  fill: 'none',
                  strokeWidth: 3,
                },
              ]}
              size={Math.min(screenW - 32, 320)}
              max={100}
              rings={5}
              backgroundFill="rgba(255, 255, 255, 0.1)" // 배경 원판 채움 색
            />
          );
        })()}

        <View style={{ flexDirection:'row', gap:12, marginTop:-8, alignItems:'center' }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
            <View style={{ width:12, height:12, borderRadius:999, backgroundColor:'rgba(59,130,246,0.8)' }} />
            <Text style={{ fontSize:12, color: THEME.text }}>전체 평균</Text>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
            <View style={{ width:12, height:12, borderRadius:999, backgroundColor:'#ff000057' }} />
            <Text style={{ fontSize:12, color: THEME.text }}>내 점수(문항 {current.seq})</Text>
          </View>
        </View>
        {/* 점수 라벨: 전체 평균(파랑) + 내 점수(초록) */}
        <CompareBars
          items={compareItems}
          peerColor="rgba(59, 131, 246, 0.45)"
          mineColor="#ff000057"
        />

      </View>
    </Animated.ScrollView>
  );
}

function QuestionVideo({
  uri,
  headers,
  height,
  initialTime = 0, // 이어보기
  onPlayer,
}: {
  uri: string;
  headers?: Record<string, string>;
  height: number;
  initialTime?: number;
  onPlayer?: (p: any) => void;
}) {

  const [loading, setLoading] = useState(true);       // 로딩 상태
  const [error, setError] = useState<string | null>(null);

  const player = useVideoPlayer(
    { uri, contentType: 'progressive', useCaching: true, headers },
    (p) => { p.loop = false; }
  );

  useEffect(() => {
    onPlayer?.(player);
  }, [player]);

  useEffect(() => {
    if (initialTime > 0) {
      player.currentTime = initialTime;
      // player.play(); // 원하면 자동재생
    }
  }, [initialTime]);

  // 🔹 비디오 상태에 따라 로딩 on/off (가능하면 네이티브 이벤트 구독)
  useEffect(() => {
    setLoading(true);

    // 가드: addEventListener가 없는 플랫폼 대비
    const add = (ev: string, fn: any) => {
      try { (player as any)?.addEventListener?.(ev, fn); } catch {}
    };
    const remove = (ev: string, fn: any) => {
      try { (player as any)?.removeEventListener?.(ev, fn); } catch {}
    };

    const onWaiting = () => setLoading(true);
    const onStalled = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onLoaded = () => setLoading(false);
    const onError = (e: any) => { setError('영상을 불러오는 중 문제가 발생했습니다.'); setLoading(false); };

    add('waiting', onWaiting);
    add('stalled', onStalled);
    add('playing', onPlaying);
    add('loadeddata', onLoaded);
    add('error', onError);

    // ⛑ 폴백: 3초가 지나도 이벤트가 안 오면 스피너 유지하되, 10초가 지나면 일단 끄고 메시지 안내
    const softTimeout = setTimeout(() => setLoading(false), 10000);

    return () => {
      clearTimeout(softTimeout);
      remove('waiting', onWaiting);
      remove('stalled', onStalled);
      remove('playing', onPlaying);
      remove('loadeddata', onLoaded);
      remove('error', onError);
    };
  }, [player]);

  return (
    <View style={{ position: 'relative' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height, backgroundColor: '#e5e7eb' }}
        nativeControls
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
        onError={(e) => {
          console.warn('video error', e);
          setError('영상을 불러오는 중 문제가 발생했습니다.');
          setLoading(false);
        }}
      />

      {/* 🔹 로딩 오버레이 */}
      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>영상 불러오는 중…</Text>
        </View>
      )}

      {/* 🔹 에러 오버레이 (선택) */}
      {error && (
        <View style={styles.loadingOverlay}>
          <Text style={[styles.loadingText, { fontWeight: '800' }]}>{error}</Text>
        </View>
      )}
    </View>
  );
}

/* ------- 작은 컴포넌트들 ------- */

function KV({ k, v, style }: { k: React.ReactNode; v: React.ReactNode, style?: any; }) {
  return (
    <View style={[{ gap: 4 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {typeof k === 'string' ? (
          <Text style={styles.kvKey}>{k}</Text>
        ) : (
          k
        )}
      </View>

      {typeof v === 'string' ? (
        <Text style={styles.kvVal}>{v}</Text>
      ) : (
        v
      )}
    </View>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{Number.isFinite(value) ? v.toFixed(1) : '0.0'}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${v}%` }]} />
      </View>
    </View>
  );
}

function RadarChart({
  labels,
  series,
  size = 280,
  max = 100,
  rings = 5,
  backgroundFill = 'transparent', // ← 배경 원판 채움
}: {
  labels: string[];
  series: { name: string; values: number[]; stroke?: string; fill?: string; strokeWidth?: number }[];
  size?: number; max?: number; rings?: number;
  backgroundFill?: string;
}) {
  // ➜ 라벨 공간을 위해 바깥 패딩
  const PADDING = 20; // 16~28 사이로 조절 가능
  const W = size + PADDING * 2;
  const H = size + PADDING * 2;
  const n = labels.length;
  const cx = W / 2, cy = H / 2;
  const radius = (size / 2) - 8;
  // ➜ 화면/사이즈에 따라 라벨 폰트 자동 축소
  const labelFontSize = size < 260 ? 11 : 12;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI / n);
  const clampVal = (v: number) => Math.max(0, Math.min(max, Number(v) || 0));

  // 배경 폴리곤 좌표
  const outerPts = labels.map((_, i) => {
    const a = angle(i);
    return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`;
  }).join(' ');

  // 그리드(링)
  const ringPolys = Array.from({ length: rings }, (_, k) => {
    const rr = (k + 1) / rings;
    const pts = labels.map((_, i) => {
      const a = angle(i);
      return `${cx + radius * rr * Math.cos(a)},${cy + radius * rr * Math.sin(a)}`;
    }).join(' ');
    return <Polygon key={k} points={pts} fill="none" stroke="#e5e7eb" />;
  });

  // 방사선
  const spokes = labels.map((_, i) => {
    const a = angle(i);
    return <Line key={i} x1={cx} y1={cy} x2={cx + radius * Math.cos(a)} y2={cy + radius * Math.sin(a)} stroke="#e5e7eb" />;
  });

  // 라벨 여백/보정 상수
const LABEL_GAP = 14;    // 축에서 라벨까지 기본 간격
const INSET_X   = -23;     // 좌우 라벨을 안쪽으로 당기는 픽셀
const ADJ_TOP   = 10;     // 맨 위 라벨을 아래로 내리는 픽셀
const ADJ_BOTTOM= 0;     // 맨 아래 라벨을 살짝 올리는 픽셀

const labelNodes = labels.map((label, i) => {
    const a = angle(i);
    const cosA = Math.cos(a), sinA = Math.sin(a);
    let lx = cx + (radius + LABEL_GAP) * cosA;
    let ly = cy + (radius + LABEL_GAP) * sinA;
    const isVertical = Math.abs(cosA) < 0.01;
    const ta = isVertical ? 'middle' : (cosA > 0 ? 'end' : 'start');
    if (!isVertical) lx += cosA > 0 ? -INSET_X : INSET_X;
    else { if (sinA < 0) ly += ADJ_TOP; else ly -= ADJ_BOTTOM; }
    return (
      <SvgText key={label} x={lx} y={ly} fontSize={size < 300 ? 11 : 12} fill="#146effff" textAnchor={ta as any}>
        {label}
      </SvgText>
    );
  });

  // 시리즈: 선만 그리기 + 선택 도트
  const seriesNodes = series.map((s, idx) => {
    const color = s.stroke ?? (idx === 0 ? '#3b82f6' : '#10b981');
    const pts = labels.map((_, i) => {
      const a = angle(i);
      const r = radius * (clampVal(s.values[i]) / max);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');

    return (
      <G key={s.name}>
        {s.fill && s.fill !== 'none' && (
          <Polygon points={pts} fill={s.fill} />
        )}
        <Polygon points={pts} fill="none" stroke={color} strokeWidth={s.strokeWidth ?? 2.5} />
      </G>
    );
  });

  return (
    <Svg width={W} height={H} style={{ overflow: 'visible' }}>
      <G>
        {/* 배경 원판 */}
        <Polygon points={outerPts} fill={backgroundFill} />
        {ringPolys}
        {spokes}
        {seriesNodes}
        {labelNodes}
      </G>
    </Svg>
  );
}

function ScoreChipsRow({
  data,
  color,
  keyPrefix,
  style,
}: {
  data: { label: string; value: any }[];
  color: string;
  keyPrefix: string;
  style?: any;
}) {
  return (
    <View style={[{ flexDirection:'row', flexWrap:'wrap', marginTop: 8, gap:8, justifyContent:'center' }, style]}>
      {data.map((c) => (
        <View key={`${keyPrefix}-${c.label}`} style={{ paddingHorizontal:10, paddingVertical:6, backgroundColor:'#f3f4f6', borderRadius:999 }}>
          <Text style={{ fontSize:12, fontWeight:'700', color:'#111827' }}>
            {c.label}{' '}
            <Text style={{ color }}>{fmtScore(c.value)}
              <Text style={{ fontSize:12, fontWeight:'700', color:'#111827' }}>{'점'}</Text>
            </Text>
          </Text>
        </View>
      ))}
    </View>
  );
}


function CompareBars({
  items,
  peerColor = '#3b83f65d',   // 전체 평균
  mineColor = '#ff000057',   // 내 점수
}: {
  items: { label: string; peer: number; mine: number; diff: number }[];
  peerColor?: string;
  mineColor?: string;
}) {
  return (
    <View style={{ width: '100%', gap: 10, marginTop: 20 }}>
      <View style={{ flexDirection:'row', gap:16, alignSelf:'center' }}>
          <Text style={styles.sectionTitle}>- 전체 평균과의 점수 비교 - </Text>
      </View>

      {items.map(it => (
        <View key={it.label} style={{ gap: 6 }}>
          {/* 라벨 + 숫자/증감 */}
          <View style={{ flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between' }}>
            <Text style={{ fontSize:12, color:'#6b7280' }}>{it.label}</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
              <Text style={{ fontSize:12, fontWeight:'800', color: peerColor }}>{fmtScore(it.peer)}</Text>
              <Text style={{ fontSize:12, fontWeight:'800', color: mineColor }}>{fmtScore(it.mine)}</Text>
              <Text style={{
                fontSize:12, fontWeight:'800',
                color: it.diff >= 0 ? '#10b981' : '#ef4444'
              }}>
                {it.diff >= 0 ? `▲${fmtScore(it.diff)}` : `▼${fmtScore(Math.abs(it.diff))}`}
              </Text>
            </View>
          </View>

          {/* 이중(2줄) 바: 위=전체 평균, 아래=내 점수 */}
          <View style={{ gap: 6 }}>
            {/* 전체 평균 바 */}
            <View style={{ height:10, borderRadius:999, backgroundColor:'#f3f4f6', overflow:'hidden' }}>
              <View
                style={{
                  position:'absolute', left:0, top:0, bottom:0,
                  width: `${Math.max(0, Math.min(100, it.peer))}%`,
                  backgroundColor: 'rgba(59,130,246,0.18)',
                  borderRightWidth: 2,
                  borderColor: peerColor,
                }}
              />
            </View>
            {/* 내 점수 바 */}
            <View style={{ height:10, borderRadius:999, backgroundColor:'#f3f4f6', overflow:'hidden' }}>
              <View
                style={{
                  position:'absolute', left:0, top:0, bottom:0,
                  width: `${Math.max(0, Math.min(100, it.mine))}%`,
                  backgroundColor: 'rgba(246, 59, 59, 0.18)',
                  borderRightWidth: 2,
                  borderColor: mineColor,
                }}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// 메달 뱃지 (리본 + 원형 그라데이션)
function MedalBadge({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={medals.item}>
      <View style={medals.medalBox}>
        {/* ^ 모양 리본 (메달 뒤) */}
        <View style={medals.ribbonCaret}>
          <View style={[medals.ribbonArm, medals.caretLeft]} />
          <View style={[medals.ribbonArm, medals.caretRight]} />
          <View style={medals.ribbonKnotTop} />
        </View>

        {/* 메달 원 */}
        <ExpoLinearGradient
          colors={['#fbbf24', '#f59e0b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={medals.medalCircle}
        >
          {children /* 아이콘(별/이모지 등) */}
        </ExpoLinearGradient>
      </View>
      {/* 라벨 */}
      <Text style={medals.label}>{label}</Text>
    </View>
  );
}

/* ------- 스타일 ------- */
const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: THEME.text },
  meta: { color: THEME.muted, marginTop: 2 },

  card: {
    backgroundColor: THEME.white,
    borderRadius: THEME.radius * 1.1,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  tabActive: {
    backgroundColor: '#111827',
  },
  tabText: { color: '#0088ffff', fontWeight: '800' },
  tabTextActive: { color: '#fff' },

  qTitle: { fontSize: 15, fontWeight: '700', color: THEME.text },
  qSub: { color: THEME.muted, marginTop: 4 },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: THEME.text, marginBottom: 8 },

  chipsWrap: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 8,
      rowGap: 8,
      marginTop: 8,
    },

  tsChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '100%',
    flexShrink: 1,
  },
  tsChipTime: { fontSize: 12, fontWeight: '800', color: THEME.text, marginRight: 2, },
  tsChipReason: { fontSize: 12, color: THEME.muted, flexShrink: 1, flexWrap: 'wrap', },
  tsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  tsChipInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },

  kvKey: { fontSize: 13, color: THEME.muted },
  kvVal: { color: THEME.text, lineHeight: 20 },

  barLabel: { color: THEME.muted, fontSize: 13 },
  barValue: { color: THEME.text, fontWeight: '800' },
  barTrack: { height: 12, borderRadius: 999, backgroundColor: THEME.track },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: THEME.fill },

  scoreNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f97316',
    marginRight: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '700',
  },
  dotDivider: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  Badge: {
    minWidth: 32,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  BadgeText: {
    fontSize: 14,
    fontWeight: '800',
  },

  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  toggleBtnActive: {
    backgroundColor: '#111827',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#312e81',
  },
  toggleTextActive: {
    color: '#fff',
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  loadingOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },

});

const ss = StyleSheet.create({
  header: {
    paddingTop: 34,
    paddingBottom: 0,
    gap: 6,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  tagline: {
    fontSize: 12,
    color: '#5f5f5fff',
  },
  taglineSecondary: {
    fontSize: 12,
    color: '#3B82F6',
  },
});

const MEDAL_SIZE = 36;

const medals = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingRight: 4,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  medalBox: {
    width: MEDAL_SIZE + 18,
    height: MEDAL_SIZE + 48,   // 위로 리본 공간
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'visible',
  },

  // ^ 리본 영역: 메달 위에 붙여 놓고 팔을 '아래 기준'으로 위로 뻗게
  ribbonCaret: {
    position: 'absolute',
    bottom: MEDAL_SIZE - 6,
    width: MEDAL_SIZE + 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 0,
  },
  ribbonArm: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 48,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  caretLeft: {
    left: (MEDAL_SIZE + 14) / 2 - 9,
    backgroundColor: '#f97316',
    transform: [{ translateX: -9 }, { rotate: '-26deg' }],
  },
  caretRight: {
    right: (MEDAL_SIZE + 14) / 2 - 9,
    backgroundColor: '#ea580c',
    transform: [{ translateX: 9 }, { rotate: '26deg' }],
  },
  // 위쪽 매듭(선택): ^ 꼭짓점에 작게
  ribbonKnotTop: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 12,
    backgroundColor: '#d97706',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },

  medalCircle: {
    position: 'absolute',
    bottom: 0,
    width: MEDAL_SIZE,
    height: MEDAL_SIZE,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1,
  },
  label: { marginTop: 6, fontSize: 11, fontWeight: '800', color: '#111827' },
});