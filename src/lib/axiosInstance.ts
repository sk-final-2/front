// src/lib/axiosInstance.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";

const REISSUE_PATH = "/api/auth/reissue";
const LOGIN_PATH = "/api/auth/login";

// 서버 에러 바디 타입 (상황에 맞게 확장 가능)
interface ApiErrorBody {
  code?: string;
  message?: string;
}

// 원 요청에 붙일 커스텀 플래그 타입
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// FormData 판별 타입가드
function isFormDataData(data: unknown): data is FormData {
  return typeof FormData !== "undefined" && data instanceof FormData;
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // or "/api"
  withCredentials: true,
});

/**
 * ✅ Request 인터셉터
 * FormData일 때 Content-Type을 제거해 axios가 boundary 포함 헤더를 자동 설정하도록.
 */
api.interceptors.request.use((config) => {
  if (isFormDataData(config.data) && config.headers) {
    const h = config.headers as AxiosRequestHeaders;
    delete h["Content-Type"];
    delete h["content-type"];
    delete h["Content-type"];
  }
  return config;
});

/**
 * ✅ Response 인터셉터 — 재발급 동시요청 잠금
 */
let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as RetryConfig | undefined;
    if (!original) throw error;

    const url = original.url || "";
    if (url.includes(REISSUE_PATH) || url.includes(LOGIN_PATH)) throw error;

    const status = error.response?.status;
    const code = error.response?.data?.code;

    // 401 또는 404 + USER001 에서만 재발급 시도
    const shouldTryReissue =
      status === 401 || (status === 404 && code === "USER001");

    if (!shouldTryReissue) throw error;
    if (original._retry) throw error;

    if (!refreshing) {
      refreshing = api
        .post(REISSUE_PATH)
        .then(() => {
          // no-op: 쿠키 세팅만 되면 OK
        })
        .finally(() => {
          refreshing = null;
        });
    }

    try {
      await refreshing; // 새 쿠키 세팅 완료 대기
      original._retry = true;
      return api.request(original); // 원 요청 1회 재시도
    } catch {
      // window.location.href = "/login?reason=session_expired";
      throw error;
    }
  }
);

export default api;
