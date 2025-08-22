import axios from 'axios';
import Constants from 'expo-constants';
import { getAccessToken, getRtid, saveLoginTokens, clearTokens } from './auth';

const { API_BASE } = (Constants.expoConfig?.extra ?? {}) as any;

function unwrap<T = any>(res: any): T {
  return (res?.data?.data ?? res?.data) as T;
}

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// 요청마다 Authorization
api.interceptors.request.use((cfg) => {
  const at = getAccessToken();
  if (at) cfg.headers.Authorization = `Bearer ${at}`;
  return cfg;
});

// 401 자동 재발급
let isRefreshing = false;
let waiters: Array<() => void> = [];

async function callReissue() {
  const rtid = await getRtid();
  if (!rtid) throw new Error('no rtid');

  // reissue는 인터셉터 타지 않게 axios(생 인스턴스) 사용
  const res = await axios.post(`${API_BASE}/api/auth/mobile/reissue`, { rtid }, {
    headers: { 'X-RTID': rtid },
    timeout: 10000,
  });
  const payload = unwrap<{ accessToken: string; rtid?: string }>(res);
  await saveLoginTokens(payload.accessToken, payload.rtid ?? rtid);
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err?.config;
    if (err?.response?.status !== 401 || original?._retry) throw err;
    original._retry = true;

    if (isRefreshing) {
      await new Promise<void>((resolve) => waiters.push(resolve));
      return api(original);
    }

    isRefreshing = true;
    try {
      await callReissue();
      waiters.forEach((w) => w());
      waiters = [];
      return api(original);
    } catch (e) {
      waiters = [];
      await clearTokens();
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

// ===== 실제 API =====

// ----- (1) 이메일/비번 모바일 로그인 -----
export async function loginWithEmail(email: string, password: string) {
  const res = await api.post('/api/auth/mobile/login', { email, password }); // 상대경로로 통일
  const payload = unwrap<{ accessToken: string; rtid: string; profile: { email: string; name: string; role?: string } }>(res);
  await saveLoginTokens(payload.accessToken, payload.rtid);
  return payload.profile;
}

// ----- (2) /me -----
export async function fetchMe() {
  const res = await api.get('/api/auth/me');
  return unwrap<{ email: string; name: string; role?: string }>(res);
}

// ----- (3) 로컬 회원가입(이메일/비번) -----
export async function signup(payload: {
  email: string;
  password: string;
  name: string;
  zipcode?: string;
  address1?: string;
  address2?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birth: string; // yyyy-MM-dd
}) {
  const res = await api.post('/api/auth/signup', payload);
  return unwrap(res);
}

/** ===== OAuth(소셜) 플로우 추가분 ===== */

// 모바일 OTT 교환 → 토큰 저장까지
export async function mobileOttExchange(ott: string) {
  const res = await api.get('/api/auth/mobile/ott-exchange', { params: { ott } });
  const payload = unwrap<{ accessToken: string; rtid: string; profile: any }>(res);
  await saveLoginTokens(payload.accessToken, payload.rtid);
  return payload.profile; // 화면에서 프로필 바로 쓸 수 있게
}
export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';
export type SocialSignupBody = {
  email: string;
  name: string;
  gender: GenderType;
  birth: string; // yyyy-MM-dd
  zipcode?: string;
  address1?: string;
  address2?: string;
};



export async function mobileKakaoSignup(body: SocialSignupBody) {
  const res = await api.post('/api/auth/mobile/kakao-signup', body);
  const payload = unwrap<{ accessToken: string; rtid: string; profile: any }>(res);
  await saveLoginTokens(payload.accessToken, payload.rtid);
  return payload.profile;
}

export async function mobileGoogleSignup(body: SocialSignupBody) {
  const res = await api.post('/api/auth/mobile/google-signup', body);
  const payload = unwrap<{ accessToken: string; rtid: string; profile: any }>(res);
  await saveLoginTokens(payload.accessToken, payload.rtid);
  return payload.profile;
}

/** ===== 인터뷰 ===== */

export type AnswerAnalysis = {
  id: number;
  seq: number;
  question: string;
  answer: string;
  good: string;
  bad: string;
  score: number;
  emotionText: string;
  mediapipeText: string;
  emotionScore: number;
  blinkScore: number;
  eyeScore: number;
  headScore: number;
  handScore: number;
};

export type AvgScore = {
  score: number;
  emotionScore: number;
  blinkScore: number;
  eyeScore: number;
  headScore: number;
  handScore: number;
};

export type Interview = {
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
  avgScore: AvgScore[];
};

// 목록 조회 (컨트롤러에 맞춰 경로 유지)
export async function fetchInterviewHistory() {
  const res = await api.get('/api/interview-results');
  return unwrap<Interview[]>(res);
}

// ---- 인터뷰 시작 타입 ----
export type InterviewStartRequest = {
  job: string;
  count: number; // 동적 모드면 0
  ocrText: string;
  career: string; // "신입" 또는 "경력 3년차"
  interviewType: 'PERSONALITY' | 'TECHNICAL' | 'MIXED';
  level: '상' | '중' | '하';
  language: 'KOREAN' | 'ENGLISH';
  seq: number; // 보통 1
};

export type FirstQuestionResponse = {
  interviewId: string;
  question: string;
  seq: number;
};

// ---- OCR 업로드 (form-data) ----
export async function uploadInterviewDocAsync(file: { uri: string; name: string; mimeType: string }) {
  const fd = new FormData();
  fd.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as any);

  const res = await api.post('/api/interview/ocr', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<{ ocrOutPut: string }>(res);
}

// ---- 첫 질문 생성 ----
export async function requestFirstQuestion(body: InterviewStartRequest) {
  const res = await api.post('/api/interview/first-question', body);
  return unwrap<FirstQuestionResponse>(res);
}

// ---- 답변 업로드 ----
export type UploadAnswerResponse = {
  interviewId: string;
  newQuestion: string;
  keepGoing: boolean;
};

export async function uploadInterviewAnswer(params: {
  videoUri: string;
  interviewId: string;
  seq: number;
  question: string;
}) {
  const fd = new FormData();
  fd.append('file', {
    uri: params.videoUri,
    name: `answer-${params.seq}.mp4`,
    type: 'video/mp4',
  } as any);
  fd.append('seq', String(params.seq));
  fd.append('interviewId', params.interviewId);
  fd.append('question', params.question);

  const res = await api.post('/api/interview/answer', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return unwrap<UploadAnswerResponse>(res);
}

export async function endInterview(interviewId: string, lastSeq: number) {
  const res = await api.post('/api/interview/end', { interviewId, lastSeq });
  return unwrap<string>(res);
}

// 면접 결과 조회
export async function fetchInterviewResult(interviewId: string) {
  const res = await api.post('/api/interview/result', { interviewId });
  return unwrap<any>(res);
}



export type MyPageResponse = {
  id: number;
  email: string;
  name: string;
  postcode?: string | null;
  address1?: string | null;
  address2?: string | null;
  gender: 'MALE' | 'FEMALE';
  birth: string;
  createdAt: string;
  updatedAt?: string | null;
};

export async function fetchMyPage() {
  const res = await api.get('/api/mypage');
  return unwrap<MyPageResponse>(res);
}

export async function updateMyPage(body: {
  password?: string;
  postcode?: string;
  address1?: string;
  address2?: string;
}) {
  const res = await api.patch('/api/mypage', body);
  return unwrap<MyPageResponse>(res);
}