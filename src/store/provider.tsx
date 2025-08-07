'use client';

import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import type { AppStore } from "@/store/store";
import { setInitialAuth, fetchAndSetUser } from "@/store/auth/authSlice";
import { useRef, useEffect } from "react";

export function ReduxProvider({
  children,
  accessToken,
}: {
  children: React.ReactNode;
  accessToken?: string;
}) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    if (accessToken) {
      storeRef.current.dispatch(setInitialAuth(accessToken));
    }
  }

  useEffect(() => {
    if (accessToken && storeRef.current) {
      storeRef.current.dispatch(fetchAndSetUser());
    }
  }, [accessToken]);

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
