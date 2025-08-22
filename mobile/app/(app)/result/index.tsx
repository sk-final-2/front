import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams } from 'expo-router';
import Svg, { G, Polygon, Line, Text as SvgText } from 'react-native-svg';

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

// ===== 테스트용 샘플(실사용시 삭제) =====
const SAMPLE: ResultData = {
  uuid: "e7ae36ec-5d05-452a-8da8-308a6f847c34",
  memberId: 1,
  createdAt: "2025년 08월 19일 17:32:42",
  job: "프론트엔드 개발자",
  career: "신입",
  type: "MIXED",
  level: "하",
  language: "KOREAN",
  count: 2,
  answerAnalyses: [
    {
      seq: 1,
      question: "자기소개 해보세요",
      answer: "입력: \"KFC 파트너로 2년 넘게 근무했고 모든 포지션에 투입되어서 근무했었습니다.  KFC에서 제대로 일해보고 싶어서 매니저직에 지원했습니다.\"",
      good: "직장 경험이 풍부하고 다양한 포지션에 투입된 경험이 있는 것",
      bad: "지원 동기나 목표가 명확하지 않아 지원 이유를 잘 설명하지 못한 것",
      score: 60,
      emotionText: "표정 감지 분석 결과: 행복 1초, 화남 1초, 무표정 3초, 슬픔 6초, 두려움 4초로 인해 감점 20점, 점수는 80점입니다!",
      mediapipeText: "눈 깜빡임 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!\n시선처리 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!\n고개 각도 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!\n손 움직임 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!",
      emotionScore: 80,
      blinkScore: 100, eyeScore: 100, headScore: 100, handScore: 100,
      timestamp: [
        { time: "00:10", reason: "표정 감지" }, { time: "00:11", reason: "표정 감지" }, { time: "00:12", reason: "표정 감지" },
        { time: "00:13", reason: "표정 감지" }, { time: "00:14", reason: "표정 감지" },
      ],
    },
    {
      seq: 2,
      question: "KFC에서 근무하면서 배가 고팠어요 ㅠㅠ 그래서 밥 ",
      answer: "입력: \"KFC 파트너로 2년 넘게 근무했고 모든 포지션에 투입되어서 근무했었습니다.  KFC에서 제대로 일해보고 싶어서 매니저직에 지원했습니다.\"",
      good: "직장 경험이 풍부하고 다양한 포지션에 투입된 경험이 있습니다.",
      bad: "지원동기나 목표가 분명하지 않습니다.",
      score: 60,
      emotionText: "표정 감지 분석 결과: 행복 1초, 화남 1초, 무표정 3초, 슬픔 6초, 두려움 4초로 인해 감점 20점, 점수는 80점입니다!",
      mediapipeText: "눈 깜빡임 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!\n시선처리 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!\n고개 각도 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!\n손 움직임 감지 분석 결과: 감점 없이 만점입니다! 점수는 100점입니다!",
      emotionScore: 80,
      blinkScore: 100, eyeScore: 100, headScore: 100, handScore: 100,
      timestamp: [
        { time: "00:01", reason: "표정 감지" }, { time: "00:03", reason: "표정 감지" }, { time: "00:04", reason: "표정 감지" },
        { time: "00:07", reason: "표정 감지" }, { time: "00:08", reason: "표정 감지" }, { time: "00:09", reason: "표정 감지" },
        { time: "00:10", reason: "표정 감지" }, { time: "00:11", reason: "표정 감지" }, { time: "00:12", reason: "표정 감지" },
        { time: "00:13", reason: "표정 감지" }, { time: "00:14", reason: "표정 감지" },
      ],
    }
  ],
  avgScore: [{ score: 83.0, emotionScore: 86.0, blinkScore: 84.4, eyeScore: 84.4, headScore: 74.6, handScore: 81.6 }],
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
const categories = ['감정', '깜빡임', '시선', '고개', '손'];

export default function ResultScreen() {

  const result: ResultData = SAMPLE;

  // 1) 평균(또는 문항별 평균) 계산
  const overall = useMemo(() => {
    const avg = result.avgScore?.[0];
    if (avg) {
      return {
        byCat: [
          { label: '감정',   value: avg.emotionScore },
          { label: '깜빡임', value: avg.blinkScore },
          { label: '시선',   value: avg.eyeScore },
          { label: '고개',   value: avg.headScore },
          { label: '손',     value: avg.handScore },
        ],
      };
    }
    // avgScore가 없으면 문항별로 계산
    const n = result.answerAnalyses.length || 1;
    const sum = { emotion:0, blink:0, eye:0, head:0, hand:0 };
    result.answerAnalyses.forEach(a => {
      sum.emotion += a.emotionScore ?? 0;
      sum.blink   += a.blinkScore   ?? 0;
      sum.eye     += a.eyeScore     ?? 0;
      sum.head    += a.headScore    ?? 0;
      sum.hand    += a.handScore    ?? 0;
    });
    return {
      byCat: [
        { label: '감정',   value: +(sum.emotion/n).toFixed(1) },
        { label: '깜빡임', value: +(sum.blink/n).toFixed(1) },
        { label: '시선',   value: +(sum.eye/n).toFixed(1) },
        { label: '고개',   value: +(sum.head/n).toFixed(1) },
        { label: '손',     value: +(sum.hand/n).toFixed(1) },
      ],
    };
  }, [result]);

  // 실제에선 params로 JSON/동영상맵을 받을 수 있어요.
  // const { data, videos } = useLocalSearchParams<{ data?: string; videos?: string }>();
  // const result: ResultData = data ? JSON.parse(decodeURIComponent(data)) : SAMPLE;
  // const videosBySeq: Record<string, string> | null = videos ? JSON.parse(decodeURIComponent(videos)) : null;
  
  // 데모용: seq→동영상 URL 매핑 (실제 URL로 바꿔주세요)
  const videosBySeq: Record<string, number> = {
    '1': require('./test.mp4'),
    '2': require('./abx.mp4'),
  };

  const [idx, setIdx] = useState(0); // 현재 선택한 질문 index
  const current = result.answerAnalyses[idx];

  // 현재 질문의 영상 URL
  const videoSrc = videosBySeq?.[String(current.seq)] ?? null;

  // ❶ 플레이어 한 번 만들고
  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });

  const [vidLoading, setVidLoading] = useState(false);

  const mmssToSec = (s: string) => {
    const [m, sec] = s.split(':').map(n => +n || 0);
    return m * 60 + sec;
  };

  const onPressTs = (ts: string) => {
    player.currentTime = mmssToSec(ts);
    player.play();
  };

  // ❷ 질문 바뀔 때 소스를 교체
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const src = videosBySeq[String(current.seq)] ?? null;

      // 기존 동기 replace() 사용 금지
      try {
        setVidLoading(true);
        player.pause();

        if (!src) {
          await player.replaceAsync(null); // 소스 제거
          return;
        }

        // 🔑 iOS에서도 렉 없이 안전
        await player.replaceAsync(src); // 필요시: { isMuted:false, initialTime:0 } 옵션 객체 사용 가능

        if (!cancelled) {
          player.play(); // 자동 재생 원치 않으면 제거
        }
      } catch (e) {
        // 에러 핸들링 (원하면 Alert)
        // console.warn('video replaceAsync failed', e);
      } finally {
        if (!cancelled) setVidLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [current.seq]);

  const bars = useMemo(() => ([
    { label: '감정', value: current.emotionScore ?? 0 },
    { label: '깜빡임', value: current.blinkScore ?? 0 },
    { label: '시선', value: current.eyeScore ?? 0 },
    { label: '고개', value: current.headScore ?? 0 },
    { label: '손', value: current.handScore ?? 0 },
  ]), [current]);

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
        <Text style={styles.qSub}>점수 {current.score} · 감정 {current.emotionScore} · 깜빡임 {current.blinkScore} · 시선 {current.eyeScore}</Text>
      </View>

      {/* 영상 + 타임스탬프 */}
      <View style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>질문 {current.seq} 답변 영상</Text>

        <View style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
          {videoSrc ? (
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
          data={overall.byCat.map(c => ({ label: c.label, value: Number(c.value || 0) }))}
          size={Math.min(screenW - 32, 320)}  // 카드 너비에 맞춤
          max={100}
          rings={5}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 }}>
          {overall.byCat.map((c) => (
            <View key={c.label} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f3f4f6', borderRadius: 999 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>
                {c.label} <Text style={{ color: '#6b7280' }}>{Number(c.value).toFixed(1)}</Text>
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
    const r = radius * (clamp(val) / max);
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
