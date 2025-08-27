// mobile/app/(app)/interview/index.tsx
import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView, KeyboardAvoidingView, Animated, ActivityIndicator, Platform, StyleSheet,  } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { uploadInterviewDocAsync, requestFirstQuestion, type InterviewStartRequest } from '../../../src/lib/api';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeSlideInText from '../../../components/FadeSlideInText';
import { Picker } from '@react-native-picker/picker';

type CareerMode = '신입' | '경력';
type ItvType = 'PERSONALITY' | 'TECHNICAL' | 'MIXED';
type Level = '상' | '중' | '하';
type Lang = 'KOREAN' | 'ENGLISH';

export const jobData: JobData = {
  "IT·인터넷": [
    "프론트엔드 개발자",
    "백엔드 개발자",
    "풀스택 개발자",
    "DevOps 엔지니어",
    "모바일 앱 개발자",
    "데이터 사이언티스트",
    "정보보안 전문가",
    "QA 엔지니어",
  ],
  "마케팅·광고": [
    "디지털 마케터",
    "콘텐츠 마케터",
    "퍼포먼스 마케터",
    "브랜드 마케터",
    "CRM 마케터",
  ],
  디자인: [
    "UI/UX 디자이너",
    "그래픽 디자이너",
    "프로덕트 디자이너",
    "영상 디자이너",
  ],
  "경영·기획": [
    "서비스 기획자",
    "프로덕트 매니저(PM)",
    "사업 개발",
    "전략 기획",
  ],
};

export type JobData = {
  [category: string]: string[];
};

export default function InterviewPrepare() {
  const r = useRouter();

  // 폼 상태
  const [jobCategory, setJobCategory] = useState<string | null>(null);
  const [job, setJob] = useState<string>('');
  const [dynamicCount, setDynamicCount] = useState(true);
  const [count, setCount] = useState(3);

  const [careerMode, setCareerMode] = useState<CareerMode>('신입');
  const [years, setYears] = useState(1);

  const [itvType, setItvType] = useState<ItvType>('MIXED');
  const [level, setLevel] = useState<Level>('하');
  const [lang, setLang] = useState<Lang>('KOREAN');

  // OCR
  const [docName, setDocName] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [loading, setLoading] = useState(false);

  //로고 애니메이션
  const [animKey, setAnimKey] = useState(0);

  async function pickDoc() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;

      const file = res.assets[0];
      setDocName(file.name || '파일');
      setLoading(true);

      const { ocrOutPut } = await uploadInterviewDocAsync({
        uri: file.uri,
        name: file.name ?? 'upload',
        mimeType: file.mimeType ?? 'application/octet-stream',
      });

      setOcrText(ocrOutPut ?? '');
      Alert.alert('OCR 완료', '문서에서 텍스트를 추출했어요.');
    } catch (e: any) {
      Alert.alert('OCR 실패', e?.response?.data?.message || e?.message || '업로드 실패');
    } finally {
      setLoading(false);
    }
  }

  function inc(setter: (n: number) => void, v: number, min = 1, max = 20) {
    const next = Math.max(min, Math.min(max, v));
    setter(next);
  }

  async function onStart() {
    if (!job.trim()) {
      Alert.alert('확인', '직무를 입력해주세요.');
      return;
    }
    if (!dynamicCount && count <= 0) {
      Alert.alert('확인', '질문 개수를 1개 이상으로 선택해주세요.');
      return;
    }

    const body: InterviewStartRequest = {
      job: job.trim(),
      count: dynamicCount ? 0 : count,
      ocrText: (ocrText || '').trim(),   
      career: careerMode === '신입' ? '신입' : `경력 ${years}년차`,
      interviewType: itvType,
      level,
      language: lang,
      seq: 1,
    };

    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const first = await requestFirstQuestion(body);
      // 다음 화면(세션)으로: 첫 질문과 인터뷰 ID 전달
      r.replace({
        pathname: '/(app)/interview/session',
        params: {
          id: first.interviewId,
          seq: String(first.seq),
          question: first.question,
          expected: String(dynamicCount ? 0 : count), // 0 = 동적 모드
        },
      });
    } catch (e: any) {
      Alert.alert('시작 실패', e?.response?.data?.message || e?.message || '서버 오류');
    } finally {
      setLoading(false);
    }
  }

return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Animated.ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 28, gap: 8, paddingTop: 0 }}
          keyboardShouldPersistTaps="handled"
          onScrollEndDrag={() => setAnimKey(k => k + 1)}
          onMomentumScrollEnd={() => setAnimKey(k => k + 1)}
        >
          {/* 헤더 */}
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

            {/* 면접 준비 타이틀 */}
            <View style={{ marginTop: 18 }}>
              <Text style={ss.title}>면접 준비</Text>
              <Text style={ss.subtitle}>직무를 선택하고 첫 질문을 받아 보세요😊</Text>
            </View>
          </View>

          {/* 직무 */}
          <Section icon="briefcase-outline" label="직무">
            <View style={{ gap: 0 }}>
              {/* 1) 대분류 선택 */}
              <Picker
                selectedValue={jobCategory ?? ''}
                onValueChange={(v: string) => {
                  setJobCategory(v === '' ? null : v);
                  setJob('');                            // 소분류 리셋
                }}
                style={{color: '#111', fontSize: 14}}
                dropdownIconColor="#111"
                itemStyle={{ fontSize: 14, color: '#111' }}
                mode="dropdown"
              >
                <Picker.Item label="직무 대분류 선택" value="" />
                {Object.keys(jobData).map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>

              {/* 2) 소분류 선택 (카테고리 선택했을 때만 표시) */}
              {jobCategory && (
                <Picker
                  selectedValue={job}
                  onValueChange={(v: string) => setJob(v)}
                  style={{color: '#111', fontSize: 14}}
                  dropdownIconColor="#111"
                  itemStyle={{ fontSize: 14, color: '#111' }}
                  mode="dropdown"
                >
                  <Picker.Item label="상세 직무 선택" value="" />
                  {jobData[jobCategory].map((j) => (
                    <Picker.Item key={j} label={j} value={j} />
                  ))}
                </Picker>
              )}

              <Text style={ss.hint}>지원 직무에 맞춰 질문이 생성돼요.</Text>
            </View>
          </Section>

          {/* 질문 개수 */}
          <Section icon="help-buoy-outline" label="질문 개수">
            <View style={{ gap: 10 }}>
              <Row>
                <Chip selected={dynamicCount} onPress={() => setDynamicCount(true)} text="동적 모드" />
                <Chip selected={!dynamicCount} onPress={() => setDynamicCount(false)} text="개수 지정" />
              </Row>

              {!dynamicCount && (
                <Row style={{ alignItems: 'center' }}>
                  <Stepper
                    value={count}
                    onChange={(v) => inc(setCount, v, 1, 10)}
                    min={1}
                    max={10}
                  />
                  <Text style={ss.note}>1~10개</Text>
                </Row>
              )}
              {dynamicCount && <Text style={ss.hint}>동적 모드에서는 Koelectra 모델을 통해 질문 개수를 정해요.</Text>}
            </View>
          </Section>

          {/* 경력 */}
          <Section icon="person-outline" label="경력">
            <View style={{ gap: 10 }}>
              <Row>
                <Chip selected={careerMode === '신입'} onPress={() => setCareerMode('신입')} text="신입" />
                <Chip selected={careerMode === '경력'} onPress={() => setCareerMode('경력')} text="경력" />
              </Row>

              {careerMode === '경력' && (
                <Row style={{ alignItems: 'center' }}>
                  <Stepper
                    value={years}
                    onChange={(v) => inc(setYears, v, 1, 30)}
                    min={1}
                    max={30}
                  />
                  <Text style={ss.note}>{years}년차</Text>
                </Row>
              )}
            </View>
          </Section>

          {/* 유형/난이도/언어 */}
          <Section icon="grid-outline" label="유형">
            <PickerRow
              options={[
                { v: 'PERSONALITY', t: '인성' },
                { v: 'TECHNICAL', t: '기술' },
                { v: 'MIXED', t: '혼합' },
              ]}
              value={itvType}
              onChange={setItvType}
            />
          </Section>

          <Section icon="speedometer-outline" label="난이도">
            <PickerRow
              options={[
                { v: '상', t: '상' },
                { v: '중', t: '중' },
                { v: '하', t: '하' },
              ]}
              value={level}
              onChange={setLevel}
            />
          </Section>

          <Section icon="language-outline" label="언어">
            <PickerRow
              options={[
                { v: 'KOREAN', t: '한국어' },
                { v: 'ENGLISH', t: '영어' },
              ]}
              value={lang}
              onChange={setLang}
            />
          </Section>

          {/* 자기소개서 업로드 & OCR */}
          <Section icon="document-text-outline" label="자기소개서/포트폴리오 (선택)">
            <Pressable
              onPress={pickDoc}
              disabled={loading}
              style={[ss.primaryBtn, loading && { opacity: 0.6 }]}
            >
              <Ionicons name="document-text-outline" size={18} color="#fff" />
              <Text style={ss.primaryBtnText}>
                {docName ? '다른 문서로 변경' : '문서 업로드(.pdf / .docx / .txt)'}
              </Text>
              {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
            </Pressable>

            {!!docName && (
              <View style={ss.docCard}>
                <Text style={{ fontWeight: '700' }}>{docName}</Text>
                <Text numberOfLines={3} style={{ color: '#374151' }}>
                  {ocrText || '텍스트를 추출했어요.'}
                </Text>
                <Pressable
                  onPress={() => { setDocName(null); setOcrText(''); }}
                  style={ss.clearBtn}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#6b7280" />
                  <Text style={{ color: '#6b7280' }}>지우기</Text>
                </Pressable>
              </View>
            )}
          </Section>

          {/* 시작 버튼 */}
          <Pressable onPress={onStart} disabled={loading} style={[ss.cta, loading && { opacity: 0.6 }]}>
            {loading ? (
              <>
                <ActivityIndicator color="#fff" />
                <Text style={ss.ctaText}>준비 중…</Text>
              </>
            ) : (
              <>
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={ss.ctaText}>첫 질문 받기</Text>
              </>
            )}
          </Pressable>

          {/* 하단 여백 */}
          <View style={{ height: 6 }} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------- 작은 UI 구성요소들 ------- */
function Section({ icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <View style={ss.card}>
      <View style={ss.sectionHeader}>
        <Ionicons name={icon} size={16} color="#111" />
        <Text style={ss.sectionTitle}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, style]}>{children}</View>;
}

function Chip({ selected, onPress, text }: { selected: boolean; onPress: () => void; text: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
        borderWidth: 1, borderColor: selected ? '#4338ca' : '#e5e7eb',
        backgroundColor: selected ? '#eef2ff' : '#fff'
      }}
    >
      <Text style={{ color: selected ? '#4338ca' : '#111', fontWeight: '700' }}>{text}</Text>
    </Pressable>
  );
}

function Stepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number; }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={stepBtn}><Text style={stepTxt}>-</Text></Pressable>
      <Text style={{ minWidth: 30, textAlign: 'center', fontWeight: '800' }}>{value}</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={stepBtn}><Text style={stepTxt}>+</Text></Pressable>
    </View>
  );
}
const stepBtn = { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' } as const;
const stepTxt = { fontSize: 18, fontWeight: '800' } as const;

function PickerRow<T extends string>({
  options, value, onChange,
}: { options: { v: T; t: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <Chip key={o.v} selected={value === o.v} onPress={() => onChange(o.v)} text={o.t} />
        ))}
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  subtitle: { marginTop: 4, color: '#6b7280' },

  card: {
    gap: 5,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    // 그림자 (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    // 그림자 (Android)
    elevation: 1.5,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 14, color: '#111' },

  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12,
    fontSize: 16,
  },
  hint: { color: '#6b7280', fontSize: 12 },
  note: { color: '#666' },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#111', paddingVertical: 12, borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  docCard: {
    gap: 6, backgroundColor: '#F8FAFC', borderColor: '#E5E7EB',
    borderWidth: 1, padding: 12, borderRadius: 12,
  },
  clearBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 8, flexDirection: 'row', gap: 4 },

  cta: {
    marginTop: 4,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    // 살짝 떠 보이게
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },

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
    color: '#6b7280',
  },
  taglineSecondary: {
    fontSize: 12,
    color: '#4338ca',
  },

  picker: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});
