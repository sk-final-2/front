// src/lib/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const REISSUE_PATH = "/api/auth/reissue";
const LOGIN_PATH   = "/api/auth/login";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // or "/api"
  withCredentials: true,
});

let refreshing: Promise<any> | null = null;

api.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original) throw error;

    const url = original.url || "";
    if (url.includes(REISSUE_PATH) || url.includes(LOGIN_PATH)) throw error;

    if (error.response?.status !== 401) throw error;
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
      // AUTH003/4라면 여기서 로그인 보내도 OK
      // window.location.href = "/login?reason=session_expired";
      throw error;
    }
  }
);

export default api;
