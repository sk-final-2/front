"use client";

import { useAppSelector } from "@/hooks/storeHook";

export default function GlobalLoadingIndicator() {
  /**
   * 페이지 이동 시 사용하는 로딩페이지
   */
  const { isLoading } = useAppSelector((state) => state.loading);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm rounded-md"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ring border-t-transparent" />
      <div className="text-sm text-foreground">로딩중...</div>
    </div>
  );
}
