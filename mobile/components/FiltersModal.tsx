import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

export type DDOption<T extends string = string> = { label: string; value: T };
export type Period = 'all' | '7d' | '30d' | 'year';

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (v: {
    period: Period;
    job: string;
    type: string;
    level: string;
    language: string;
    sortAsc: boolean;
  }) => void;
  onReset?: () => void;
  value: {
    period: Period;
    job: string;
    type: string;
    level: string;
    language: string;
    sortAsc: boolean;
  };
  options: {
    period: DDOption<Period>[];
    job: DDOption[];
    type: DDOption[];
    level: DDOption[];
    language: DDOption[];
  };
};

export default function FiltersModal({
  visible, onClose, onApply, onReset, value, options,
}: Props) {
  const [period, setPeriod] = useState<Period>(value.period);
  const [job, setJob] = useState(value.job);
  const [type, setType] = useState(value.type);
  const [level, setLevel] = useState(value.level);
  const [language, setLanguage] = useState(value.language);
  const [sortAsc, setSortAsc] = useState(value.sortAsc);

  useEffect(() => {
    if (visible) {
      setPeriod(value.period);
      setJob(value.job);
      setType(value.type);
      setLevel(value.level);
      setLanguage(value.language);
      setSortAsc(value.sortAsc);
    }
  }, [visible, value]);

  const apply = () => {
    onApply({ period, job, type, level, language, sortAsc });
    onClose();
  };
  const reset = () => {
    onReset?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={s.wrap} pointerEvents="box-none">
        <View style={s.sheet}>
          <Text style={s.title}>필터 · 정렬</Text>
          <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <Section title="기간">
              <RowSelect options={options.period} selected={period} onChange={setPeriod} />
            </Section>
            <Section title="직무">
              <RowSelect options={options.job} selected={job} onChange={setJob} />
            </Section>
            <Section title="유형">
              <RowSelect options={options.type} selected={type} onChange={setType} />
            </Section>
            <Section title="레벨">
              <RowSelect options={options.level} selected={level} onChange={setLevel} />
            </Section>
            <Section title="언어">
              <RowSelect options={options.language} selected={language} onChange={setLanguage} />
            </Section>
            <Section title="정렬">
              <RowSelect
                options={[{ label: '최신순', value: 'desc' }, { label: '오래된순', value: 'asc' }]}
                selected={sortAsc ? 'asc' : 'desc'}
                onChange={(v) => setSortAsc(v === 'asc')}
              />
            </Section>
          </ScrollView>

          <View style={s.actions}>
            <Pressable onPress={reset} style={[s.btn, s.btnGhost]}>
              <Text style={[s.btnTxt, s.btnGhostTxt]}>초기화</Text>
            </Pressable>
            <Pressable onPress={apply} style={[s.btn, s.btnPrimary]}>
              <Text style={[s.btnTxt, s.btnPrimaryTxt]}>적용</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.secTitle}>{title}</Text>
      {children}
    </View>
  );
}

function RowSelect<T extends string>({
  options, selected, onChange,
}: { options: DDOption<T>[]; selected?: T; onChange: (v: T) => void }) {
  return (
    <View style={s.rowWrap}>
      {options.map(o => {
        const active = o.value === selected;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.pill, active && s.pillActive]}>
            <Text style={[s.pillTxt, active && s.pillTxtActive]} numberOfLines={1}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
  wrap: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 16, gap: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
  },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  secTitle: { fontSize: 14, color: '#6b7280', marginBottom: 8, fontWeight: '700' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff',
  },
  pillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  pillTxt: { color: '#111827', fontWeight: '600' },
  pillTxtActive: { color: '#fff' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnGhost: { backgroundColor: '#f3f4f6' },
  btnGhostTxt: { color: '#111827', fontWeight: '800' },
  btnPrimary: { backgroundColor: '#111827' },
  btnPrimaryTxt: { color: '#fff', fontWeight: '800' },
});
