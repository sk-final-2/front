// mobile/src/lib/social.ts
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { saveLoginTokens } from './auth';
import { api } from './api';

WebBrowser.maybeCompleteAuthSession();

// 앱 딥링크 (app.config.js 의 scheme 가 'mobile' 이라고 가정)
const RETURN_URL = Linking.createURL('oauth-callback');

// 백엔드 베이스
const API_BASE: string = (Constants.expoConfig?.extra as any)?.API_BASE;

type Provider = 'kakao' | 'google';

async function exchangeOtt(ott: string) {
  const res = await api.get(`/api/auth/mobile/ott-exchange`, { params: { ott } });
  const data = res.data?.data ?? res.data;
  return data as {
    accessToken?: string;
    rtid?: string;
    profile?: { email: string; name: string; role?: string };
    needSignup?: boolean;
    email?: string;
    name?: string;
    provider?: string;
  };
}

export async function startSocialLogin(provider: Provider) {
  // ✅ 모바일 분기 + 우리 딥링크를 스프링에 전달
const authUrl =
  `${API_BASE}/oauth2/authorize/${provider}` +   // <-- authorize (브리지) 사용
  `?target=mobile&redirect_uri=${encodeURIComponent(RETURN_URL)}`;

  // ✅ 최신 SDK: startAsync 대신 openAuthSessionAsync만 사용
  const result = await WebBrowser.openAuthSessionAsync(authUrl, RETURN_URL);
  console.log('RETURN_URL =', RETURN_URL); // => mobile://oauth-callback 이어야 정상

  if (result.type !== 'success' || !result.url) {
    throw new Error(result.type === 'cancel' ? '사용자가 취소했습니다.' : '로그인 실패');
  }

  // 딥링크로 돌아올 때: mobile://oauth-callback?ott=...&needSignup=1...
  const parsed = Linking.parse(result.url);
  const q = parsed.queryParams ?? {};
  const needSignup = q.needSignup === '1' || q.needSignup === 'true';
  const ott = (q.ott as string) || '';

  if (needSignup) {
    return {
      needSignup: true as const,
      email: (q.email as string) || '',
      name: (q.name as string) || '',
      provider: (q.provider as string) || provider,
    };
  }

  if (!ott) throw new Error('응답 파싱 실패(ott 없음)');
  const payload = await exchangeOtt(ott);

  if (payload.needSignup) {
    return { needSignup: true as const, ...payload };
  }

  if (!payload.accessToken || !payload.rtid) throw new Error('토큰 교환 실패');
  await saveLoginTokens(payload.accessToken, payload.rtid);
  return { needSignup: false as const, profile: payload.profile };
}
