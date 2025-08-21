import axios from 'axios';
import Constants from 'expo-constants';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './auth';

const { API_BASE } = (Constants.expoConfig?.extra ?? {}) as any;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// 요청마다 Authorization 붙이기
api.interceptors.request.use(async (config) => {
  const at = getAccessToken();
  if (at) config.headers.Authorization = `Bearer ${at}`;
  return config;
});

// 401이면 refresh 시도 후 재요청
let isRefreshing = false;
let queue: { resolve: (v?: unknown)=>void; reject: (e:any)=>void }[] = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err?.response?.status !== 401 || original?._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    if (isRefreshing) {
      await new Promise((resolve, reject) => queue.push({ resolve, reject }));
      return api(original);
    }
    isRefreshing = true;
    try {
      const rt = await getRefreshToken();
      if (!rt) throw new Error('no refresh');

      // <- 백엔드 엔드포인트에 맞게 경로 확인: 예) /api/auth/refresh
      const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken: rt });
      await saveTokens(data.accessToken, rt);

      queue.forEach((p) => p.resolve());
      queue = [];
      return api(original);
    } catch (e) {
      queue.forEach((p) => p.reject(e));
      queue = [];
      await clearTokens();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

// 샘플 API
export async function loginWithEmail(email: string, password: string) {
  // <- 백엔드 경로/필드명 맞춰 수정: 예) /api/auth/login
  const { data } = await api.post('/api/auth/login', { email, password });
  return data as { accessToken: string; refreshToken: string };
}
