'use client';

import { Provider } from "react-redux";
import { makeStore } from "@/store/store";
import type { AppStore } from "@/store/store";
import { setInitialAuth } from "@/store/auth/authSlice";
import { useRef } from "react";

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

  return <Provider store={storeRef.current}>{children}</Provider>;
}
