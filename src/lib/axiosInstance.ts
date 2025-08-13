// src/lib/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const REISSUE_PATH = "/api/auth/reissue";
const LOGIN_PATH   = "/api/auth/login";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // or "/api"
  withCredentials: true,
});

/**
 * ✅ Request 인터셉터
 * FormData일 때는 Content-Type을 제거해서
 * axios가 boundary 포함 헤더를 자동으로 설정하도록 한다.
 */
api.interceptors.request.use((config) => {
  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData && config.headers) {
    // 혹시라도 어디선가 json으로 고정해둔 게 있으면 전부 제거
    delete (config.headers as any)["Content-Type"];
    delete (config.headers as any)["content-type"];
    delete (config.headers as any)["Content-type"];
  }
  return config;
});

/**
 * ✅ Response 인터셉터
 */
let refreshing: Promise<any> | null = null;

api.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original) throw error;

    const url = original.url || "";
    if (url.includes(REISSUE_PATH) || url.includes(LOGIN_PATH)) throw error;

    const status = error.response?.status;
    const code = (error.response?.data as any)?.code;

    // ✅ 401 이거나, 404 + USER001(서버가 인증 실패를 이렇게 내보내는 경우)면 재발급 시도
    const shouldTryReissue =
      status === 401 || (status === 404 && code === "USER001");

    if (!shouldTryReissue) throw error;
    if (original._retry) throw error;

    if (!refreshing) {
      refreshing = api.post(REISSUE_PATH)
        .catch(e => { throw e; })
        .finally(() => { refreshing = null; });
    }

    try {
      await refreshing;           // 쿠키에 새 accessToken/rtid 세팅
      original._retry = true;
      return api(original);       // 원요청 재시도
    } catch {
      // window.location.href = "/login?reason=session_expired";
      throw error;
    }
  }
);

export default api;
