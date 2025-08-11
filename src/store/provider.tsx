// src/store/provider.tsx
"use client";

import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import type { AppStore } from "@/store/store";
import { setInitialAuth, fetchAndSetUser } from "@/store/auth/authSlice";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export function ReduxProvider({
  children,
  accessToken,
}: {
  children: React.ReactNode;
  accessToken?: string;
}) {
  const storeRef = useRef<AppStore | null>(null);
  const pathname = usePathname();

  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (accessToken) {
      storeRef.current.dispatch(setInitialAuth(accessToken));
    }
  }

  useEffect(() => {
    if (!storeRef.current) return;

    const publicPrefixes = [
      "/login",
      "/oauth/success",
      "/kakao-signup",
      "/google-signup",
    ]; //여기서는 유저 정보 조회 안하도록
    const isPublic = publicPrefixes.some((p) => pathname.startsWith(p));
    if (isPublic) return;

    const state = storeRef.current.getState();
    const isLoggedIn = state.auth.isLoggedIn; // 로그인 안한 상황에서는 메인에서도 유저 정보 조회 안하도록
    if (!isLoggedIn) return;

    storeRef.current.dispatch(fetchAndSetUser());
  }, [pathname]);

  // 로그 확인 - store에 있는 정보 확인 용도(이후 삭제 예정)
  // useEffect(() => {
  //   if (!storeRef.current) return;

  //   const unsubscribe = storeRef.current.subscribe(() => {
  //     console.log("현재 Redux 상태:", storeRef.current!.getState());
  //   });

  //   return unsubscribe;
  // }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
