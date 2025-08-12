// src/store/provider.tsx
"use client";

import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import type { AppStore } from "@/store/store";
import { fetchAndSetUser, setInitialAuth } from "@/store/auth/authSlice";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/axiosInstance";

const REISSUE_PATH = "/api/auth/reissue"; // ⚠ baseURL이 "/api"면 "/auth/reissue"로 바꾸세요.

export function ReduxProvider({
  children,
  accessToken, // SSR 등에서 초기 로그인 상태를 넘겨주는 용도면 남겨둠
}: {
  children: React.ReactNode;
  accessToken?: string;
}) {
  const storeRef = useRef<AppStore | null>(null);
  const pathname = usePathname();
  const triedRef = useRef(false); // 이 라우트 진입에서 reissue를 한 번만 시도

  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (accessToken) {
      // 기존 로직 유지(선택). accessToken을 더 이상 안 쓴다면 이 부분 제거해도 됨.
      storeRef.current.dispatch(setInitialAuth(accessToken));
    }
  }

  useEffect(() => {
    if (!storeRef.current) return;

    // 공개 라우트에서는 아무 것도 안 함
    const publicPrefixes = ["/login", "/oauth/success", "/kakao-signup", "/google-signup"];
    if (publicPrefixes.some((p) => pathname.startsWith(p))) return;

    // 라우트 진입 시 1회: 조용히 reissue 시도
    //  - accessToken 쿠키가 사라진 상태여도, rtid 쿠키만 살아있다면 서버가 새 토큰을 Set-Cookie로 내려줌
    //  - 실패해도 그냥 넘기고, 다음 fetchAndSetUser에서 401 나면 인터셉터가 한 번 더 시도함
    if (!triedRef.current) {
      triedRef.current = true;
      (async () => {
        try {
          await api.post(REISSUE_PATH);
        } catch {
          // 실패는 조용히 무시(하드 만료면 아래 fetch에서 401 → 인터셉터/로그아웃 처리)
        } finally {
          // 💡 이전처럼 isLoggedIn 가드 두지 말고 무조건 호출:
          //    - 새로고침 후 isLoggedIn=false라도 호출되어 401을 유도 → 인터셉터가 /reissue를 실행
          storeRef.current!.dispatch(fetchAndSetUser());
        }
      })();
    } else {
      // 같은 라우트에서 다시 렌더되면 바로 사용자 정보만 가져오도록
      storeRef.current.dispatch(fetchAndSetUser());
    }
  }, [pathname]);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
