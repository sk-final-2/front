// mobile/app/(app)/interview/session.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Alert, Platform, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { saveResult } from '../../../src/lib/resultCache';
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
  type CameraType,
} from 'expo-camera';
import { Client } from '@stomp/stompjs';

import { getAccessToken } from '../../../src/lib/auth';
import {
  uploadInterviewAnswer,
  endInterview,
  fetchInterviewResult,
} from '../../../src/lib/api';
import SockJS from 'sockjs-client';
import Constants from 'expo-constants';
type Params = { id: string; seq: string; question: string; expected?: string };

const { API_BASE, WS_BASE } = (Constants.expoConfig?.extra ?? {}) as any;

// SockJS는 http/https로 붙어야 함 (ws/wss → http/https 변환)
const WS_HTTP_BASE =
  String(WS_BASE || API_BASE)
    .replace(/\/$/, '')
    .replace(/^ws:/, 'http:')
    .replace(/^wss:/, 'https:'); // 예: http://192.168.0.160:8080/ws

const SOCKJS_ENDPOINT = `${WS_HTTP_BASE}/interview`; // 최종: http(s)://.../ws/interview

export default function InterviewSession() {
  const r = useRouter();
  const { id, seq, question, expected } = useLocalSearchParams<Params>();

  const [curSeq, setCurSeq] = useState<number>(Number(seq ?? '1') || 1);
  const [curQ, setCurQ] = useState<string>(question || '');
  const expectedCount = Number(expected ?? '0') || 0; // 0 = 동적

  // 진행상태
  const [recording, setRecording] = useState(false);
  const [count, setCount] = useState(60);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [waitingNext, setWaitingNext] = useState(false); // 다음 질문/응답 대기 로딩
  const [ending, setEnding] = useState(false);           // 면접 종료 후 분석 대기 로딩

  // TTS/자막
  const [speaking, setSpeaking] = useState(false);
  const [caption, setCaption] = useState('');
  const speakTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 권한
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  // 카메라
  const camRef = useRef<CameraView | null>(null);
  const facing: CameraType | 'front' | 'back' = 'front';
  const shouldUploadRef = useRef(false); // 중복 업로드 방지

  // 권한 요청/정리
  useEffect(() => {
    (async () => {
      if (!camPerm?.granted) await requestCamPerm();
      if (!micPerm?.granted) await requestMicPerm();
    })();
    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
      if (speakTimer.current) clearInterval(speakTimer.current);
      try { Speech.stop(); } catch {}
    };
  }, []);

  // 간단 TTS + 자막
  const speakQuestion = useCallback((text: string) => {
    try { Speech.stop(); } catch {}
    setCaption('');
    setSpeaking(true);

    Speech.speak(text, {
      language: 'ko-KR',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });

    if (speakTimer.current) clearInterval(speakTimer.current);
    const total = text.length;
    const durationMs = Math.max(1500, Math.min(7000, total * 80));
    const fps = 20;
    const steps = Math.max(10, Math.floor((durationMs / 1000) * fps));
    let i = 0;
    speakTimer.current = setInterval(() => {
      i++;
      const n = Math.floor((i / steps) * total);
      setCaption(text.slice(0, n));
      if (i >= steps) {
        clearInterval(speakTimer.current!);
        speakTimer.current = null;
      }
    }, 1000 / fps);
  }, []);

  // 질문 바뀌면 읽어주기
  useEffect(() => { if (curQ) speakQuestion(curQ); }, [curQ, speakQuestion]);

  // 타이머
  const startTimer = () => {
    if (tickTimer.current) clearInterval(tickTimer.current);
    setCount(60);
    tickTimer.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(tickTimer.current!);
          tickTimer.current = null;
          stopRecording(); // 타임아웃 → 자동 제출
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // 녹화 시작
  const startRecording = async () => {
    if (!camPerm?.granted || !micPerm?.granted) {
      Alert.alert('권한 필요', '카메라/마이크 권한을 허용해주세요.');
      await requestCamPerm(); await requestMicPerm();
      return;
    }
    if (Platform.OS === 'web') {
      Alert.alert('안내', '웹에서는 카메라 녹화가 제한될 수 있어요. 모바일 기기에서 테스트해 주세요.');
      return;
    }

    try {
      setRecording(true);
      shouldUploadRef.current = true;
      startTimer();

      camRef.current!
        .recordAsync({ maxDuration: 65 }) // 60초에 수동 종료, 65초는 안전선
        .then(async (video) => {
          if (!shouldUploadRef.current) return;
          shouldUploadRef.current = false;
          setRecording(false);
          if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }

          setWaitingNext(true);
          await sendVideo(video.uri);
          setWaitingNext(false);
        })
        .catch(() => {
          setRecording(false);
          if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }
        });
    } catch (e: any) {
      setRecording(false);
      if (tickTimer.current) { clearInterval(tickTimer.current); tickTimer.current = null; }
      Alert.alert('녹화 실패', e?.message || '카메라 오류');
    }
  };

  // 수동 종료 → recordAsync resolve
  const stopRecording = async () => {
    try { await camRef.current?.stopRecording(); } catch {}
  };

  const sendVideo = async (uri: string) => {
  try {
    const res = await uploadInterviewAnswer({
      videoUri: uri,
      interviewId: id!,
      seq: curSeq,
      question: curQ,
    });

    const isFixed = expectedCount > 0;

    if (isFixed) {
      // 고정 개수 모드: 현재 질문이 목표에 도달했으면 종료
      if (curSeq >= expectedCount) {
        // 업로드 대기 오버레이 끄고 종료 플로우 진입
        setWaitingNext(false);
        await finishInterview();
        return;
      }

      // 아직 남았으면 다음 질문으로 (keepGoing은 무시)
      const nextSeq = curSeq + 1;
      const nextQ = res.newQuestion ?? `${nextSeq}번째 질문입니다.`;
      setCurSeq(nextSeq);
      setCurQ(nextQ);
      return;
    }

    // 동적 모드: 서버가 keepGoing=false 주면 종료
    if (!res.keepGoing) {
      setWaitingNext(false);
      await finishInterview();
      return;
    }

    // 계속 진행이면 새 질문으로
    if (res.newQuestion) {
      setCurSeq((s) => s + 1);
      setCurQ(res.newQuestion);
    } else {
      // 방어적으로 질문이 없으면 종료
      setWaitingNext(false);
      await finishInterview();
    }
  } catch (e: any) {
    setWaitingNext(false);
    Alert.alert('업로드 실패', e?.response?.data?.message || e?.message || '서버 오류');
  }
};

const finishInterview = async () => {
  try {
    setEnding(true);
    await endInterview(id!, curSeq);
    await waitForSocketSignal(id!);         // 소켓 신호 대기
    const result = await fetchInterviewResult(id!); // 결과 조회

    saveResult(String(id), result);         // 캐시에 저장
    setEnding(false);
    r.replace({ pathname: '/(app)/result', params: { id: String(id) } }); // 결과 페이지로
  } catch (e: any) {
    setEnding(false);
    Alert.alert('종료 처리 실패', e?.response?.data?.message || e?.message || '서버 오류');
    r.replace('/(app)');
  }
};

async function waitForSocketSignal(interviewId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const token = getAccessToken() || '';

    // 핸드셰이크에서 헤더 못 읽는 경우 대비해서 쿼리로도 전달
    const url = token
      ? `${SOCKJS_ENDPOINT}?access_token=${encodeURIComponent(token)}`
      : SOCKJS_ENDPOINT;

    const client = new Client({
      // SockJS로 붙어야 400이 안 남 (brokerURL 쓰지 말 것)
      webSocketFactory: () => new SockJS(url),

      // 서버가 STOMP CONNECT 헤더로 인증을 읽는 경우 대비
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},

      reconnectDelay: 3000,
      debug: () => {},
      onConnect: () => {
        const sub = client.subscribe(`/topic/interview/${interviewId}`, () => {
          try { sub.unsubscribe(); } catch {}
          try { client.deactivate(); } catch {}
          resolve();
        });
      },
      onStompError: (frame) => {
        try { client.deactivate(); } catch {}
        reject(new Error(frame.headers?.message || 'STOMP error'));
      },
      onWebSocketClose: () => {
        // 재연결은 reconnectDelay로 처리
      },
    });

    client.activate();

    // 30초 타임아웃: 신호 없어도 이후 /result 폴링 시도
    setTimeout(() => {
      try { client.deactivate(); } catch {}
      resolve();
    }, 30000);
  });
}

  // 권한 뷰
  if (camPerm?.granted === false || micPerm?.granted === false) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
        <Text>카메라/마이크 권한이 필요합니다. 설정에서 허용 후 다시 시도해 주세요.</Text>
      </View>
    );
  }
  if (!camPerm || !micPerm) {
    return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Text>권한 확인 중…</Text></View>;
  }

  return (
    <View style={{ flex:1, paddingTop: 50 }}>
      {/* 상단: 질문/자막 */}
      <View style={{ padding:16, gap:8 }}>
        <Text style={{ fontSize:16, fontWeight:'800' }}>{curSeq}. 질문</Text>
        <Text style={{ fontSize:18 }}>{curQ}</Text>

        {!!caption && (
          <View style={{ backgroundColor:'#111', padding:10, borderRadius:10 }}>
            <Text style={{ color:'#fff' }}>{caption}</Text>
          </View>
        )}

        <View style={{ flexDirection:'row', gap:8 }}>
          <Pressable onPress={() => speakQuestion(curQ)} style={btnSecondary}>
            <Text style={btnSecondaryText}>{speaking ? '읽는 중…' : '다시 읽어줘'}</Text>
          </Pressable>
        </View>
      </View>

      {/* 카메라 */}
      <View style={{ flex:1, borderTopWidth:1, borderColor:'#eee' }}>
        {Platform.OS === 'web' ? (
          <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:16 }}>
            <Text>웹에서는 카메라 미리보기가 제한될 수 있어요. 모바일 기기에서 테스트해 주세요.</Text>
          </View>
        ) : (
          <CameraView ref={camRef} style={{ flex:1 }} facing={facing} videoQuality="720p" mode="video" />
        )}
      </View>

      {/* 하단 컨트롤 */}
      <View style={{ padding:16, gap:10, borderTopWidth:1, borderColor:'#eee' }}>
        {recording ? (
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
            <Text style={{ fontSize:16, fontWeight:'800', color:'#ef4444' }}>● 녹화 중</Text>
            <Text style={{ fontSize:16 }}>{count}s</Text>
          </View>
        ) : (
          <Text style={{ color:'#666' }}>
            {expectedCount > 0 ? `최대 ${expectedCount}문항 / 각 60초` : '동적 모드 · 각 60초'}
          </Text>
        )}

        {!recording ? (
          <Pressable onPress={startRecording} style={btnPrimary}>
            <Text style={btnPrimaryText}>답변 시작</Text>
          </Pressable>
        ) : (
          <Pressable onPress={stopRecording} style={[btnPrimary, { backgroundColor:'#ef4444' }]}>
            <Text style={btnPrimaryText}>답변 종료 및 제출</Text>
          </Pressable>
        )}

      </View>

      {/* 다음 질문/업로드 대기 오버레이 */}
      {waitingNext && (
        <View style={overlay}>
          <ActivityIndicator />
          <Text style={overlayText}>업로드 중 · 다음 질문 생성 중…</Text>
        </View>
      )}

      {/* 종료/분석 대기 오버레이 */}
      {ending && (
        <View style={overlay}>
          <ActivityIndicator />
          <Text style={overlayText}>면접이 종료되었습니다. 결과 분석 중…</Text>
        </View>
      )}
    </View>
  );
}

const btnPrimary = {
  backgroundColor: '#4f46e5',
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: 'center',
} as const;
const btnPrimaryText = { color:'#fff', fontWeight:'800', fontSize:16 } as const;

const btnSecondary = {
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  alignItems: 'center',
} as const;
const btnSecondaryText = { fontWeight:'700' } as const;

const btnGhost = { alignSelf:'flex-start', padding:10 } as const;
const btnGhostText = { color:'#6b7280' } as const;

const overlay = {
  position: 'absolute',
  left: 0, right: 0, top: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
} as const;
const overlayText = { color: '#fff', fontWeight: '700' } as const;
