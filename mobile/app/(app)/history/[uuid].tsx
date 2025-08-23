// mobile/app/(app)/history/[uuid].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  ViewStyle, TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInterview } from '../../../src/lib/historyCache';
import type { Interview, AnswerAnalysis, AvgScore } from '../../../src/lib/api';

const METRICS = [
  { key: 'score',        label: '종합' },
  { key: 'emotionScore', label: '감정' },
  { key: 'blinkScore',   label: '깜빡임' },
  { key: 'eyeScore',     label: '시선' },
  { key: 'headScore',    label: '머리' },
  { key: 'handScore',    label: '손' },
] as const;

function normalizePair(value: number, avg: number) {
  if (avg <= 1 && value > 1.5) avg = avg * 100;
  return { value, avg };
}
function diffText(value: number, avg: number) {
  const { value: v, avg: a } = normalizePair(value, avg);
  const delta = v - a;
  const rel = a !== 0 ? (delta / a) * 100 : 0;
  const sign = delta > 0 ? '+' : '';
  if (Math.abs(a) < 1e-6) return `${sign}${delta.toFixed(1)}`;
  return `${sign}${rel.toFixed(0)}%`;
}
function barStyle(value: number, avg: number) {
  const { value: v, avg: a } = normalizePair(value, avg);
  const delta = v - a;
  const pct = a !== 0 ? Math.max(-100, Math.min(100, (delta / a) * 100)) : (delta === 0 ? 0 : 100 * Math.sign(delta));
  const w = Math.min(100, Math.abs(pct));
  const color = delta >= 0 ? '#16a34a' : '#ef4444';
  return { widthPct: w, color, positive: delta >= 0 };
}

/* ── 동적 스타일은 StyleSheet 밖에서 ViewStyle로 정의 ── */
const pill = (positive: boolean, color: string): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: color,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
});
const barDelta = (positive: boolean, widthPct: number, color: string): ViewStyle => ({
  position: 'absolute',
  left: positive ? '50%' : undefined,
  right: positive ? undefined : '50%',
  width: `${widthPct / 2}%`,
  height: '100%',
  backgroundColor: color,
});

export default function HistoryDetail() {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const r = useRouter();
  const [iv, setIv] = useState<Interview | null>(null);

  useEffect(() => { setIv(getInterview(uuid)); }, [uuid]);

  if (!iv) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', gap:8, padding:16 }}>
        <Text>기록을 찾을 수 없어요.</Text>
        <Pressable onPress={() => r.back()} style={{ padding:10 }}><Text>← 돌아가기</Text></Pressable>
      </View>
    );
  }

  const avg: AvgScore | undefined = iv.avgScore?.[0];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* 헤더 */}
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
        <Pressable onPress={() => r.back()} style={{ paddingVertical:6, paddingRight:8, flexDirection:'row', alignItems:'center', gap:6 }}>
          <Ionicons name="chevron-back" size={20} /><Text>뒤로</Text>
        </Pressable>
        <Text style={{ fontSize:16, fontWeight:'700' }}>{iv.job || '면접 기록'}</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* 평균 요약 */}
      {avg ? (
        <View style={styles.avgCard}>
          <Text style={styles.sectionTitle}>세션 평균</Text>
          <View style={styles.avgRow}>
            {METRICS.slice(0, 3).map((m) => {
              const raw = (avg as any)?.[m.key] ?? 0;
              const shown = raw <= 1 ? raw * 100 : raw;
              return (
                <View key={m.key} style={styles.avgChip}>
                  <Text style={styles.avgLabel}>{m.label}</Text>
                  <Text style={styles.avgValue}>{shown.toFixed(1)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* 문항별 차이 */}
      {iv.answerAnalyses.map((a) => (
        <QuestionCard key={a.id ?? a.seq} a={a} avg={avg} />
      ))}
    </ScrollView>
  );
}

function QuestionCard({ a, avg }: { a: AnswerAnalysis; avg?: AvgScore }) {
  return (
    <View style={styles.qCard}>
      <Text style={styles.qTitle}>{a.seq + 1}. {a.question}</Text>
      <Text style={styles.qAnswer} numberOfLines={3}>{a.answer}</Text>

      <View style={{ gap: 8 }}>
        {METRICS.map(m => {
          const v = (a as any)[m.key] as number;
          const av = (avg as any)?.[m.key] as number | undefined;
          const { widthPct, color, positive } = barStyle(v ?? 0, av ?? 0);
          return (
            <View key={m.key} style={{ gap: 6 }}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <View style={pill(positive, color)}>
                  <Ionicons name={positive ? 'arrow-up' : 'arrow-down'} size={12} color="#fff" />
                  <Text style={{ color:'#fff', fontWeight:'700' }}>{diffText(v ?? 0, av ?? 0)}</Text>
                </View>
              </View>

              <View style={styles.barBase}>
                <View style={styles.barNeutral} />
                <View style={barDelta(positive, widthPct, color)} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.coachBox}>
        <Text style={styles.coachGood}>👍 {a.good || '강점 분석 없음'}</Text>
        <Text style={styles.coachBad}>⚠️ {a.bad || '개선점 분석 없음'}</Text>
      </View>
    </View>
  );
}

/* ── 키별 스타일 타입을 명시 ── */
type Styles = {
  avgCard: ViewStyle;
  sectionTitle: TextStyle;
  avgRow: ViewStyle;
  avgChip: ViewStyle;
  avgLabel: TextStyle;
  avgValue: TextStyle;

  qCard: ViewStyle;
  qTitle: TextStyle;
  qAnswer: TextStyle;

  metricHeader: ViewStyle;
  metricLabel: TextStyle;

  barBase: ViewStyle;
  barNeutral: ViewStyle;

  coachBox: ViewStyle;
  coachGood: TextStyle;
  coachBad: TextStyle;
};

const styles = StyleSheet.create<Styles>({
  avgCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  avgRow: { flexDirection: 'row', gap: 8 },
  avgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  avgLabel: { color: '#666' },
  avgValue: { fontWeight: '700' },

  qCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  qTitle: { fontWeight: '700' },
  qAnswer: { color: '#444' },

  metricHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLabel: { color: '#555', fontWeight: '600' },

  barBase: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 999, overflow: 'hidden', position: 'relative' },
  barNeutral: { position: 'absolute', left: '50%', width: 2, height: '100%', backgroundColor: '#CBD5E1' },

  coachBox: { backgroundColor: '#FAFAFA', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#EEE', gap: 4 },
  coachGood: { color: '#166534', fontWeight: '600' },
  coachBad: { color: '#991B1B', fontWeight: '600' },
});
