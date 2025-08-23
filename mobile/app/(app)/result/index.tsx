import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import Svg, { G, Polygon, Line, Text as SvgText } from 'react-native-svg';
import { getResult } from '../../../src/lib/resultCache';
import { getAccessToken } from '../../../src/lib/auth';

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

// 점수 → 등급/색상 팔레트
function getGrade(score: number) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  if (s >= 90) return { grade: 'A', color: '#10b981', tint: 'rgba(16,185,129,0.10)', border: '#10b981' }; // emerald
  if (s >= 80) return { grade: 'B', color: '#0ea5e9', tint: 'rgba(14,165,233,0.10)', border: '#0ea5e9' }; // sky
  if (s >= 70) return { grade: 'C', color: '#f59e0b', tint: 'rgba(245,158,11,0.10)', border: '#f59e0b' }; // amber
  if (s >= 60) return { grade: 'D', color: '#f97316', tint: 'rgba(249,115,22,0.10)', border: '#f97316' }; // orange
  return { grade: 'F', color: '#ef4444', tint: 'rgba(239,68,68,0.10)', border: '#ef4444' };                // red
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

  // 2) 평균(또는 문항별 평균) 계산
  const overall = useMemo(() => {
    const avg = result.avgScore?.[0];
    if (avg) {
      return {
        byCat: [
          { label: '감정',   value: toNum(avg.emotionScore) },
          { label: '깜빡임', value: toNum(avg.blinkScore) },
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
        { label: '깜빡임', value: sum.blink   / n },
        { label: '시선',   value: sum.eye     / n },
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: THEME.bg }} contentContainerStyle={{ padding: 16, paddingTop: 50, paddingBottom: 40 }}>
      {/* 헤더 */}
      <Text style={styles.title}>면접 결과</Text>
      <Text style={styles.meta}>
        {result.job} · {result.career} · {result.type} · {result.level} · {result.language}
      </Text>
      <Text style={[styles.meta, { marginBottom: 10 }]}>{result.createdAt}</Text>

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
        <Text style={styles.qTitle}>질문 {current.seq}. {current.question}</Text>

        {/* 하단: 점수/등급 뱃지 2개 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          {/* 점수 뱃지 */}
          <View style={[styles.Badge, { borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)' }]}>
            <Text style={[styles.BadgeText, { color: '#f59e0b' }]}>{Math.round(current.score)}</Text>
          </View>
          <Text style={[styles.scoreLabel, { marginLeft: 6 }]}>점수</Text>

          {/* 구분점 */}
          <View style={[styles.dotDivider, { marginHorizontal: 10 }]} />

          {/* 등급 뱃지 */}
          {(() => {
            const { grade, color, tint, border } = getGrade(toNum(current.score));
            return (
              <>
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
        <Text style={styles.sectionTitle}>✅ 질문 {current.seq} 답변 영상</Text>

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
          <View style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>🚨 감점 포인트</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {groupViolations(current.timestamp, 5).map((seg) => (
                <TouchableOpacity
                  key={seg.start}
                  onPress={() => playSegment(seg.start, seg.end)}
                  style={styles.tsChip}
                >
                  <Text style={styles.tsChipTime}>{secToMmss(seg.start)}~{secToMmss(seg.end)}</Text>
                  <Text style={styles.tsChipReason}> · {countsToString(seg.counts)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

      {/* 상세 정보 */}
      <View style={[styles.card, { marginTop: 12, gap: 10 }]}>
        <Text style={styles.sectionTitle}>자세한 정보</Text>
        <KV k="😊 잘한 점" v={current.good} />
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
                {c.label} <Text style={{ color: '#3359a5ff' }}>{fmtScore(c.value)}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
      fill="#113c81ff"
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
          stroke="#244488ff"
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

});
