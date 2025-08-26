// mobile/app/(app)/history/index.tsx
import { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchInterviewHistory, type Interview } from '../../../src/lib/api';
import { cacheInterviews } from '../../../src/lib/historyCache';
import { Picker } from '@react-native-picker/picker';
import FiltersModal, { DDOption, Period } from '../../../components/FiltersModal';

  type Filters = {
    period: Period;
    job: string;
    type: string;
    level: string;
    language: string;
  };

  const PAGE_SIZE = 5; // 페이지당 개수

  function inPeriod(d: Date, period: Period) {
    const now = new Date();
    if (period === 'all') return true;
    if (period === '7d') {
      const seven = new Date(now); seven.setDate(seven.getDate() - 7);
      return d >= seven;
    }
    if (period === '30d') {
      const thr = new Date(now); thr.setDate(thr.getDate() - 30);
      return d >= thr;
    }
    if (period === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  }

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

  const [filters, setFilters] = useState<Filters>({
    period: 'all',
    job: 'ALL',
    type: 'ALL',
    level: 'ALL',
    language: 'ALL',
  });
  const [sortAsc, setSortAsc] = useState(false); // 날짜 정렬: false=최신순, true=오래된순
  const [openFilters, setOpenFilters] = useState(false);
  const [page, setPage] = useState(1);

  // 드롭다운 옵션
  const options = useMemo(() => {
    const jobs = new Set<string>(), types = new Set<string>(), levels = new Set<string>(), langs = new Set<string>();
    (list ?? []).forEach(it => {
      if (it.job) jobs.add(it.job);
      if (it.type) types.add(it.type);
      if (it.level) levels.add(it.level);
      if (it.language) langs.add(it.language);
    });
    const toArr = (s: Set<string>) => ['전체', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'ko'))];
    return {
      job: toArr(jobs),
      type: toArr(types),
      level: toArr(levels),
      language: toArr(langs),
      period: [
        { label: '전체', value: 'all' as Period },
        { label: '최근 7일', value: '7d' as Period },
        { label: '최근 30일', value: '30d' as Period },
        { label: '올해', value: 'year' as Period },
      ],
    };
  }, [list]);

  // 옵션 -> 드롭다운 형식으로 변환
  const periodOpts: DDOption<Period>[] = options.period.map(p => ({ label: p.label, value: p.value }));
  const jobOpts: DDOption[] = (options.job).map(v => ({ label: v, value: v }));
  const typeOpts: DDOption[] = (options.type).map(v => ({ label: v, value: v }));
  const levelOpts: DDOption[] = (options.level).map(v => ({ label: v, value: v }));
  const langOpts: DDOption[] = (options.language).map(v => ({ label: v, value: v }));
  const sortOpts: DDOption<'desc' | 'asc'>[] = [
    { label: '최신순', value: 'desc' },
    { label: '오래된순', value: 'asc' },
  ];

    // 필터 적용 수(뱃지)
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.period !== 'all') n++;
    if (filters.job !== 'ALL') n++;
    if (filters.type !== 'ALL') n++;
    if (filters.level !== 'ALL') n++;
    if (filters.language !== 'ALL') n++;
    if (sortAsc) n++; // asc만 카운트 (기본 최신순 desc)
    return n;
  }, [filters, sortAsc]);

  // 필터 + 정렬 결과
  const filteredSorted = useMemo(() => {
    const arr = (list ?? []).filter((it) => {
      const d = toDate(it.createdAt);
      if (!d) return false;
      if (!inPeriod(d, filters.period)) return false;
      if (filters.job !== 'ALL' && it.job !== filters.job) return false;
      if (filters.type !== 'ALL' && it.type !== filters.type) return false;
      if (filters.level !== 'ALL' && it.level !== filters.level) return false;
      if (filters.language !== 'ALL' && it.language !== filters.language) return false;
      return true;
    });
    arr.sort((a, b) => {
      const da = toDate(a.createdAt)?.getTime() ?? 0;
      const db = toDate(b.createdAt)?.getTime() ?? 0;
      return sortAsc ? da - db : db - da;
    });
    return arr;
  }, [list, filters, sortAsc]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, currentPage]);

  // 필터/정렬 변경 시 페이지 초기화
  useEffect(() => { setPage(1); }, [filters, sortAsc]);

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
      {/* 트리거 버튼 */}
      <View style={styles.filtersWrap}>
        <Pressable onPress={() => setOpenFilters(true)} style={styles.filterTrigger}>
          <Ionicons name="funnel-outline" size={16} color="#111827" />
          <Text style={styles.filterTriggerTxt}>필터 · 정렬</Text>
          {activeCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeTxt}>{activeCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* 필터/정렬 모달 */}
      <FiltersModal
        visible={openFilters}
        onClose={() => setOpenFilters(false)}
        value={{ ...filters, sortAsc }}
        options={{
          period: periodOpts,
          job: jobOpts,
          type: typeOpts,
          level: levelOpts,
          language: langOpts,
        }}
        onApply={(v) => {
          setFilters({
            period: v.period,
            job: v.job,
            type: v.type,
            level: v.level,
            language: v.language,
          });
          setSortAsc(v.sortAsc);
        }}
        onReset={() => {
          setFilters({ period: 'all', job: 'ALL', type: 'ALL', level: 'ALL', language: 'ALL' });
          setSortAsc(false); // 최신순
        }}
      />

      <FlatList
        contentInsetAdjustmentBehavior="automatic" // ⬅️ iOS 자동 보정
        contentContainerStyle={{ padding: 16, gap: 12 }}
        data={pageSlice}
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
        ListFooterComponent={(
          <View style={styles.paginationWrap}>
            <View style={styles.paginationRow}>
              {/* 이전 */}
              <Pressable
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                disabled={currentPage === 1}
                onPress={() => setPage(p => Math.max(1, p - 1))}
              >
                <View style={styles.btnInner}>
                  <Ionicons name="arrow-back" size={16} color="#fff" style={styles.iconLeft} />
                  <Text style={styles.pageBtnText}>이전</Text>
                </View>
              </Pressable>

              <Text style={styles.pageIndicator}>{currentPage} / {totalPages}</Text>

              {/* 다음 */}
              <Pressable
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                disabled={currentPage === totalPages}
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <View style={styles.btnInner}>
                  <Ionicons name="arrow-forward" size={16} color="#fff" style={styles.iconRight} />
                  <Text style={styles.pageBtnText}>다음</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
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

function FilterButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={fb.btn}
    >
      <Text style={fb.txt} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const fb = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999,
    maxWidth: '48%',
    gap: 6,
    elevation: 1,
  },
  txt: { color: '#111827', fontWeight: '600' },
});


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

  filtersWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    zIndex: 10,
  },

  paginationWrap: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20, // 세 요소 사이 간격
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: '#fff', fontWeight: '700', textAlign: 'center', },
  pageIndicator: { color: '#666', fontWeight: '700' },
  
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    elevation: 1,
  },
  filterTriggerTxt: { fontWeight: '800', color: '#111827' },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  countBadgeTxt: { color: '#fff', fontWeight: '800' },
});
