// mobile/src/lib/auth.ts
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Constants from 'expo-constants';

const RTID_KEY = 'rtid';
const { API_BASE } = (Constants.expoConfig?.extra ?? {}) as any;

let _accessToken: string | null = null;
let _rtidCache: string | null = null;

export function getAccessToken() {
  return _accessToken;
}

export async function saveLoginTokens(accessToken: string, rtid: string) {
  _accessToken = accessToken;
  _rtidCache = rtid;
  await SecureStore.setItemAsync(RTID_KEY, rtid);
}

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export async function getRtid() {
  if (_rtidCache) return _rtidCache;
  const v = await SecureStore.getItemAsync(RTID_KEY);
  _rtidCache = v;
  return v;
}

export async function clearTokens() {
  _accessToken = null;
  _rtidCache = null;
  await SecureStore.deleteItemAsync(RTID_KEY);
}

// 앱 첫 진입 때: RTID만으로 access 재발급 시도
export async function bootstrapAuth(): Promise<boolean> {
  try {
    const rtid = await getRtid();
    if (!rtid) return false;

    // 서버가 ResponseDto<T>라면 data.data, 아니면 data
    const res = await axios.post(`${API_BASE}/api/auth/mobile/reissue`, { rtid }, {
      headers: { 'X-RTID': rtid },
      timeout: 10000,
    });
    const payload = (res.data?.data ?? res.data) as { accessToken: string; rtid?: string };
    await saveLoginTokens(payload.accessToken, payload.rtid ?? rtid);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
}
