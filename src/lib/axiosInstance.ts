import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { bootstrapReissue, markIssuedNow, scheduleReissue } from "./tokenRefresher";

const REISSUE_PATH = "/api/auth/reissue";
const LOGIN_PATH = "/api/auth/login";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // 또는 "/api" (리라이트 쓰면 권장)
  withCredentials: true,
});

// 앱 시작 시 선제 리이슈 부트스트랩
bootstrapReissue(api, REISSUE_PATH);

// 로그인/리이슈 성공 시 "발급 시각" 갱신
api.interceptors.response.use(
  (res) => {
    const url = res.config?.url || "";
    const m = (res.config?.method || "get").toLowerCase();
    if (m === "post" && (url.endsWith(LOGIN_PATH) || url.endsWith(REISSUE_PATH))) {
      markIssuedNow();
      scheduleReissue(api, REISSUE_PATH);
    }
    return res;
  },
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original) return Promise.reject(error);

    const url = original.url || "";

    // reissue 자기 자신/로그인은 스킵 → 루프 방지
    if (url.includes(REISSUE_PATH) || url.includes(LOGIN_PATH)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) return Promise.reject(error);
    if (original._retry) return Promise.reject(error);

    // 동시성 제어는 기존 그대로 유지 가능 (생략)
    original._retry = true;
    try {
      await api.post(REISSUE_PATH); // 여기서 실패해도 catch에서 그냥 종료
      return api(original);
    } catch {
      return Promise.reject(error); // 실패 시 재요청/리로드 안 함 (루프 차단)
    }
  }
);

export default api;
