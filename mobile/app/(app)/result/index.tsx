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
  // 선택: 평균 점수 들어오면 하단에서 쓸 수 있어요
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

export default function ResultScreen() {
  const r = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

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
  const current = result.answerAnalyses[Math.min(idx, result.answerAnalyses.length - 1)];

  // 5) expo-video player
  const player = useVideoPlayer(null, (p) => { p.loop = false; });
  const [vidLoading, setVidLoading] = useState(false);

  // 현재 질문의 원격 소스 구성
  const source: VideoSource | null = id ? {
    uri: mediaUrl(id, current.seq),
    contentType: 'progressive',  // mp4 스트리밍에 적합
    useCaching: true,
    headers: {
      // 백엔드 인증이 필요 없다면 이 줄은 제거하세요
      Authorization: `Bearer ${getAccessToken() || ''}`,
    },
  } : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setVidLoading(true);
        player.pause();
        await player.replaceAsync(source); // iOS도 렉 없이 안전
        if (!cancelled && source) {
          // 자동재생 원치 않으면 이 줄을 주석 처리
          player.play();
        }
      } catch (e) {
        await player.replaceAsync(null);
      } finally {
        if (!cancelled) setVidLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // seq나 id가 바뀔 때만 로드
  }, [source?.uri]);

  const onPressTs = (ts: string) => {
    player.currentTime = mmssToSec(ts);
    player.play();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: THEME.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
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
            onPress={() => setIdx(i)}
            style={[styles.tab, i === idx && styles.tabActive]}
          >
            <Text style={[styles.tabText, i === idx && styles.tabTextActive]}>{a.seq}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 현재 질문 제목/요약 */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.qTitle}>질문 {current.seq}. {current.question}</Text>
        <Text style={styles.qSub}>총 점수 {current.score}점</Text>
      </View>

      {/* 영상 + 타임스탬프 */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>질문 {current.seq} 답변 영상</Text>

        <View style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
          {source?.uri ? (
            <>
              <VideoView
                player={player}
                style={{
                  width: '100%',
                  height: Math.round((screenW - 32) * 9 / 16),
                  backgroundColor: '#e5e7eb',
                }}
                nativeControls
                allowsFullscreen
                allowsPictureInPicture
                contentFit="contain"
              />

              {/* 로딩 오버레이 */}
              {vidLoading && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 0, right: 0, top: 0, bottom: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.4)',
                  }}
                >
                  <ActivityIndicator />
                  <Text style={{ marginTop: 6, color: THEME.muted }}>영상 불러오는 중…</Text>
                </View>
              )}
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
            <Text style={styles.sectionTitle}>감점 포인트</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {current.timestamp.map((t, i) => (
                <TouchableOpacity key={`${t.time}-${i}`} onPress={() => onPressTs(t.time)} style={styles.tsChip}>
                  <Text style={styles.tsChipTime}>{t.time}</Text>
                  <Text style={styles.tsChipReason}> · {t.reason}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

      {/* 상세 정보 */}
      <View style={[styles.card, { marginTop: 12, gap: 10 }]}>
        <Text style={styles.sectionTitle}>자세한 정보</Text>
        <KV k="잘한 점" v={current.good} />
        <KV k="아쉬운 점" v={current.bad} />
        {current.emotionText ? <KV k="감정 분석" v={current.emotionText} /> : null}
        {current.mediapipeText ? <KV k="동작 분석" v={current.mediapipeText.replace(/\n/g, '  ')} /> : null}
      </View>

      {/* 평균 점수 (오각형 레이더) */}
      <View style={[styles.card, { marginTop: 12, alignItems: 'center' }]}>
        <Text style={styles.sectionTitle}>평균 점수</Text>

        <RadarChart
          data={overall.byCat.map(c => ({ label: c.label, value: toNum(c.value) }))}
          size={Math.min(screenW - 32, 320)}  // 카드 너비에 맞춤
          max={100}
          rings={5}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
          {overall.byCat.map((c) => (
            <View key={c.label} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f3f4f6', borderRadius: 999 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>
                {c.label} <Text style={{ color: '#6b7280' }}>{fmtScore(c.value)}</Text>
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  data,               // [{ label:'감정', value:86 }, ...]
  size = 280,
  max = 100,
  rings = 5,
}: {
  data: { label: string; value: number }[];
  size?: number; max?: number; rings?: number;
}) {
  const n = data.length;
  const cx = size / 2, cy = size / 2;
  const radius = (size / 2) - 16;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI / n);
  const clamp = (v: number) => Math.max(0, Math.min(max, v));

  const point = (val: number, i: number) => {
    const a = angle(i);
    const r = radius * (clamp(toNum(val)) / max);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    return `${x},${y}`;
  };

  const areaPoints = data.map((d, i) => point(d.value ?? 0, i)).join(' ');

  // 동심원(다각형) 링
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

  // 바큇살(축)
  const spokes = data.map((_, i) => {
    const a = angle(i);
    const x = cx + radius * Math.cos(a);
    const y = cy + radius * Math.sin(a);
    return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" />;
  });

  // 라벨
  const labels = data.map((d, i) => {
    const a = angle(i);
    const lx = cx + (radius + 12) * Math.cos(a);
    const ly = cy + (radius + 12) * Math.sin(a);
    const ta = Math.abs(Math.cos(a)) < 0.01 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
    return (
      <SvgText key={d.label} x={lx} y={ly} fontSize="12" fill="#374151" textAnchor={ta}>
        {d.label}
      </SvgText>
    );
  });

  return (
    <Svg width={size} height={size}>
      <G>
        {ringPolys}
        {spokes}
        <Polygon
          points={areaPoints}
          fill="rgba(17,24,39,0.15)"   // #111827 15%
          stroke="#111827"
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
});
