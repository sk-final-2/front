import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Svg, { G, Polygon, Line, Text as SvgText } from 'react-native-svg';
import { getResult } from '../../../src/lib/resultCache';
import { getAccessToken } from '../../../src/lib/auth';
import FadeSlideInText from '../../../components/FadeSlideInText';
import { Ionicons } from '@expo/vector-icons';

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
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
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
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {multiGrouped.map(({ sec, reasons }) => (
        <TouchableOpacity
          key={`multi-${sec}`}
          onPress={() => onPlaySegment(sec, sec + MULTI_PREVIEW_SEC)}
          style={styles.tsChip}
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
          <Text style={styles.sectionTitle}>🚨 감점 포인트</Text>

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

        <View style={[styles.resultRow, { marginTop: 6 }]}>
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
        <Text style={[styles.title, { marginBottom: 12 }]}>📊 면접 결과</Text>
        <Text style={styles.qTitle}>질문 {current.seq}. {current.question}</Text>

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
        <Text style={styles.sectionTitle}>🎥 질문 {current.seq} 답변 영상</Text>

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
        <KV k="😊 긍정 피드백" v={current.good} />
        <KV k="😭 아쉬운 점" v={current.bad} />
        {current.emotionText ? <KV k="😁 감정 분석" v={current.emotionText} /> : null}
        {current.mediapipeText ? (
          <KV
            k="🏃‍♂️ 동작 분석"
            v={
              <Text style={styles.kvVal}>
                {formatMediapipeText(current.mediapipeText).map((line, i) => (
                  <Text key={i}>
                    • {line}
                    {"\n"}
                  </Text>
                ))}
              </Text>
            }
          />
        ) : null}
      </View>

      {/* 평균 점수 (오각형 레이더) */}
      <View style={[styles.card, { marginTop: 10, alignItems: 'center' }]}>
        <Text style={styles.sectionTitle}>- 평균 점수- </Text>

        <RadarChart
          data={overall.byCat.map(c => ({ label: c.label, value: toNum(c.value) }))}
          size={Math.min(screenW - 32, 320)}  // 카드 너비에 맞춤
          max={100}
          rings={5}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: -30 }}>
          {overall.byCat.map((c) => (
            <View key={c.label} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f3f4f6', borderRadius: 999 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>
                {c.label} <Text style={{ color: '#3B82F6' }}>{fmtScore(c.value)}<Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>{'점'}</Text></Text>
              </Text>
            </View>
          ))}
        </View>
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

  return (
    <VideoView
      player={player}
      style={{ width: '100%', height, backgroundColor: '#e5e7eb' }}
      nativeControls
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
      onError={(e) => console.warn('video error', e)}
    />
  );
}

/* ------- 작은 컴포넌트들 ------- */

function KV({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.kvKey}>{k}</Text>
      <Text style={styles.kvVal}>{v}</Text>
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
  data,
  size = 280,
  max = 100,
  rings = 5,
}: {
  data: { label: string; value: number }[];
  size?: number; max?: number; rings?: number;
}) {
  // ➜ 라벨 공간을 위해 바깥 패딩
  const PADDING = 20; // 16~28 사이로 조절 가능
  const W = size + PADDING * 2;
  const H = size + PADDING * 2;

  const n = data.length;
  const cx = W / 2, cy = H / 2;

  // ➜ 라벨 겹침 줄이려고 반지름 살짝 감소
  const radius = (size / 2) - 8;

  // ➜ 화면/사이즈에 따라 라벨 폰트 자동 축소
  const labelFontSize = size < 260 ? 11 : 12;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI / n);
  const clamp = (v: number) => Math.max(0, Math.min(max, v));
  const point = (val: number, i: number) => {
    const a = angle(i);
    const r = radius * (clamp(Number(val) || 0) / max);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return `${x},${y}`;
  };

  const areaPoints = data.map((d, i) => point(d.value ?? 0, i)).join(' ');

  const ringPolys = Array.from({ length: rings }, (_, k) => {
    const rr = (k + 1) / rings;
    const pts = data.map((_, i) => {
      const a = angle(i);
      const x = cx + radius * rr * Math.cos(a);
      const y = cy + radius * rr * Math.sin(a);
      return `${x},${y}`;
    }).join(' ');
    return <Polygon key={k} points={pts} fill="none" stroke="#e5e7eb" />;
  });

  const spokes = data.map((_, i) => {
    const a = angle(i);
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" />;
  });

  // 라벨 여백/보정 상수
const LABEL_GAP = 14;    // 축에서 라벨까지 기본 간격
const INSET_X   = -20;     // 좌우 라벨을 안쪽으로 당기는 픽셀
const ADJ_TOP   = 10;     // 맨 위 라벨을 아래로 내리는 픽셀
const ADJ_BOTTOM= 2;     // 맨 아래 라벨을 살짝 올리는 픽셀

const labels = data.map((d, i) => {
  const a = angle(i);
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);

  // 기본 위치(축 끝에서 LABEL_GAP만큼 바깥)
  let lx = cx + (radius + LABEL_GAP) * cosA;
  let ly = cy + (radius + LABEL_GAP) * sinA;

  // 앵커: 오른쪽은 안쪽으로('end'), 왼쪽은 안쪽으로('start'), 위/아래는 중앙
  const isVertical = Math.abs(cosA) < 0.01;
  const ta = isVertical ? 'middle' : (cosA > 0 ? 'end' : 'start');

  // ✔ 좌우 라벨은 축에서 더 "안쪽"으로 INSET_X만큼 추가 이동
  if (!isVertical) {
    lx += cosA > 0 ? -INSET_X : INSET_X;  // 오른쪽이면 왼쪽(-), 왼쪽이면 오른쪽(+)
  } else {
    // ✔ 맨 위/맨 아래 라벨은 살짝 세로 보정
    if (sinA < 0) ly += ADJ_TOP;      // top(위) → 조금 내리기(+)
    else          ly -= ADJ_BOTTOM;   // bottom(아래) → 조금 올리기(-)
  }

  return (
    <SvgText
      key={d.label}
      x={lx}
      y={ly}
      fontSize={size < 300 ? 11 : 12}
      fill="#146effff"
      textAnchor={ta as any}
    >
      {d.label}
    </SvgText>
  );
});

  return (
    <Svg
      width={W}
      height={H}
      // ➜ 텍스트가 SVG 바깥으로 나가도 보이도록
      style={{ overflow: 'visible' }}
    >
      <G>
        {ringPolys}
        {spokes}
        <Polygon
          points={areaPoints}
          fill="rgba(52, 63, 209, 0.15)"
          stroke="#609cfdff"
          strokeWidth={2}
        />
        {labels}
      </G>
    </Svg>
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
  tabText: { color: '#312e81', fontWeight: '800' },
  tabTextActive: { color: '#fff' },

  qTitle: { fontSize: 15, fontWeight: '700', color: THEME.text },
  qSub: { color: THEME.muted, marginTop: 4 },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: THEME.text, marginBottom: 8 },

  tsChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tsChipTime: { fontSize: 12, fontWeight: '800', color: THEME.text },
  tsChipReason: { fontSize: 12, color: THEME.muted },

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
