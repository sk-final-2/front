// mobile/app/(app)/interview/index.tsx
import { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { uploadInterviewDocAsync, requestFirstQuestion, type InterviewStartRequest } from '../../../src/lib/api';
import * as Haptics from 'expo-haptics';

type CareerMode = '신입' | '경력';
type ItvType = 'PERSONALITY' | 'TECHNICAL' | 'MIXED';
type Level = '상' | '중' | '하';
type Lang = 'KOREAN' | 'ENGLISH';

export default function InterviewPrepare() {
  const r = useRouter();

  // 폼 상태
  const [job, setJob] = useState('프론트엔드 개발자');
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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: '800' }}>면접 준비</Text>

      {/* 직무 */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: '700' }}>직무</Text>
        <TextInput
          value={job}
          onChangeText={setJob}
          placeholder="예) 프론트엔드 개발자"
          style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12 }}
        />
      </View>

      {/* 질문 개수: 동적 / 고정 */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>질문 개수</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip selected={dynamicCount} onPress={() => setDynamicCount(true)} text="동적 모드" />
          <Chip selected={!dynamicCount} onPress={() => setDynamicCount(false)} text="개수 지정" />
        </View>

        {!dynamicCount && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Stepper
              value={count}
              onChange={(v) => inc(setCount, v, 1, 10)}
              min={1}
              max={10}
            />
            <Text style={{ color: '#666' }}>1~10개</Text>
          </View>
        )}
        {dynamicCount && <Text style={{ color: '#666' }}>동적 모드에서는 서버가 유동적으로 개수를 정해요.</Text>}
      </View>

      {/* 경력 */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>경력</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip selected={careerMode === '신입'} onPress={() => setCareerMode('신입')} text="신입" />
          <Chip selected={careerMode === '경력'} onPress={() => setCareerMode('경력')} text="경력" />
        </View>
        {careerMode === '경력' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Stepper
              value={years}
              onChange={(v) => inc(setYears, v, 1, 30)}
              min={1}
              max={30}
            />
            <Text style={{ color: '#666' }}>{years}년차</Text>
          </View>
        )}
      </View>

      {/* 유형/난이도/언어 */}
      <PickerRow
        label="유형"
        options={[
          { v: 'PERSONALITY', t: '인성' },
          { v: 'TECHNICAL', t: '기술' },
          { v: 'MIXED', t: '혼합' },
        ]}
        value={itvType}
        onChange={setItvType}
      />

      <PickerRow
        label="난이도"
        options={[
          { v: '하', t: '하' },
          { v: '중', t: '중' },
          { v: '상', t: '상' },
        ]}
        value={level}
        onChange={setLevel}
      />

      <PickerRow
        label="언어"
        options={[
          { v: 'KOREAN', t: '한국어' },
          { v: 'ENGLISH', t: '영어' },
        ]}
        value={lang}
        onChange={setLang}
      />

      {/* 자기소개서 업로드 & OCR */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>자기소개서OR포트폴리오(선택)</Text>
        <Pressable
          onPress={pickDoc}
          disabled={loading}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: '#111', paddingVertical: 12, borderRadius: 12, justifyContent: 'center',
            opacity: loading ? 0.6 : 1
          }}
        >
          <Ionicons name="document-text-outline" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700' }}>
            {docName ? '다른 문서로 변경' : '문서 업로드(.pdf / .docx / .txt)'}
          </Text>
        </Pressable>

        {!!docName && (
            <View style={{ gap:6, backgroundColor:'#F8FAFC', borderColor:'#E5E7EB', borderWidth:1, padding:12, borderRadius:12 }}>
                <Text style={{ fontWeight:'700' }}>{docName}</Text>
                <Text numberOfLines={3} style={{ color:'#374151' }}>{ocrText || '텍스트를 추출했어요.'}</Text>
                <Pressable onPress={() => { setDocName(null); setOcrText(''); }} style={{ alignSelf:'flex-start', padding:8 }}>
                    <Text style={{ color:'#6b7280' }}>지우기</Text>
                </Pressable>
            </View>
        )}
      </View>
      

      {/* 시작 버튼 */}
      <Pressable
        onPress={onStart}
        disabled={loading}
        style={{
          marginTop: 4,
          backgroundColor: '#4f46e5',
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
          {loading ? '준비 중…' : '첫 질문 받기'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

/* ------- 작은 UI 구성요소들 ------- */
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
  label, options, value, onChange,
}: { label: string; options: { v: T; t: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontWeight: '700' }}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <Chip key={o.v} selected={value === o.v} onPress={() => onChange(o.v)} text={o.t} />
        ))}
      </View>
    </View>
  );
}
