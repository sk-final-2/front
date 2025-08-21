// mobile/app/(app)/history/index.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; // ⬅️ 추가
import { fetchInterviewHistory, type Interview } from '../../../src/lib/api';
import { cacheInterviews } from '../../../src/lib/historyCache';

// ------ 날짜 유틸 (history/index.tsx 상단에 넣기) ------
function parseKoreanDateString(s: string): Date | null {
  const m = s.trim().match(
    /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );
  if (!m) return null;
  const [, yy, MM, dd, hh, mm, ss] = m;
  const d = new Date(Number(yy), Number(MM) - 1, Number(dd), Number(hh), Number(mm), ss ? Number(ss) : 0);
  return isNaN(d.getTime()) ? null : d;
}

function toDate(v: unknown): Date | null {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'string') {
    if (v.includes('년') && v.includes('월') && v.includes('일')) {
      const d = parseKoreanDateString(v);
      if (d) return d;
    }
    let s = v.trim();
    if (s.includes(' ') && !s.includes('T')) s = s.replace(' ', 'T');
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === 'number') {
    const ms = v > 1e12 ? v : v * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDate(v: unknown) {
  const d = toDate(v);
  if (!d) return '-';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function avgFrom(i: Interview) {
  const a = i.avgScore?.[0];
  if (!a) return null;
  const needsScale = a.score <= 1 && (i.answerAnalyses?.some(x => x.score > 1.5));
  const scale = needsScale ? 100 : 1;
  return { ...a, score: a.score * scale, _scale: scale as 1 | 100 } as any;
}

export default function HistoryList() {
  const r = useRouter();
  const insets = useSafeAreaInsets(); // ⬅️ 안전영역
  const [list, setList] = useState<Interview[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchInterviewHistory();
        setList(data);
        cacheInterviews(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top + 3 }]} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>기록 불러오는 중…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!list || list.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top + 3 }]} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="file-tray-outline" size={36} />
          <Text style={{ marginTop: 6 }}>아직 면접 기록이 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top + 3 }]} edges={['top']}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic" // ⬅️ iOS 자동 보정
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={list}
        keyExtractor={(it) => it.uuid}
        renderItem={({ item }) => {
          const avg = avgFrom(item);
          return (
            <Pressable
              onPress={() => r.push({ pathname: '/(app)/history/[uuid]', params: { uuid: item.uuid } })}
              style={styles.card}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.title}>{item.job || '직무 미지정'}</Text>
                <Text style={styles.badge}>{item.type} · {item.level}</Text>
              </View>

              <Text style={styles.sub}>{formatDate(item.createdAt)} · {item.language} · {item.count}문항</Text>

              {avg && (
                <View style={styles.metrics}>
                  <MetricChip label="평균 종합" value={avg.score} />
                  <MetricChip label="표정" value={(avg as any).emotionScore * ((avg as any)._scale || 1)} />
                  <MetricChip label="시선" value={(avg as any).eyeScore * ((avg as any)._scale || 1)} />
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Text style={{ color: '#666' }}>자세히 보기</Text>
                <Ionicons name="chevron-forward" />
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

function MetricChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{(value ?? 0).toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' }, // ⬅️ 추가
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { color: '#666' },
  badge: { backgroundColor: '#eef2ff', color: '#4338ca', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 6 },
  chip: { flexDirection: 'row', gap: 6, borderWidth: 1, borderColor: '#eee', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  chipLabel: { color: '#666' },
  chipValue: { fontWeight: '700' },
});
