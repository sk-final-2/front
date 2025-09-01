// src/components/interview/VideoSwapStage.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import InterviewerView from "@/components/interview/InterviewerView";
import UserVideo from "@/components/interview/UserVideo";
import { cn } from "@/lib/utils";

type Props = {
  /** 유저 카메라 스트림 */
  userStream: MediaStream | null;
  /** MintBotView 프롭 그대로 전달 */
  talking?: boolean;
  amp?: number;

  /** PiP 위치 (Tailwind 위치 유틸) */
  pipPositionClassName?: string;

  /** TTS 중 여부 (컨트롤 오버레이 문구/포커스 처리용) */
  isTtsPlaying?: boolean;

  className?: string;
};

export default function VideoSwapStage({
  userStream,
  talking,
  amp,
  pipPositionClassName = "top-3 right-3",
  isTtsPlaying = false,
  className,
}: Props) {
  const [main, setMain] = useState<"user" | "bot">("bot");
  const swap = useCallback(
    () => setMain((m) => (m === "user" ? "bot" : "user")),
    [],
  );

  const pipSizeClass = useMemo(
    () => "w-28 sm:w-32 md:w-44 xl:w-56 aspect-video",
    [],
  );

  return (
    <section
      className={[
        // ✅ 항상 16:9
        "relative w-full aspect-video rounded-2xl overflow-hidden bg-white shadow-sm",
        className ?? "",
      ].join(" ")}
      aria-label="Interview stage"
    >
      {/* 메인(전체) */}
      <button
        type="button"
        onClick={swap}
        className="absolute inset-0 w-full h-full focus:outline-none"
        aria-label="Swap videos"
      >
        <div className="absolute inset-0">
          {main === "user" ? (
            <UserVideo stream={userStream} className="h-full" fit="contain" />
          ) : (
            <InterviewerView talking={talking} amp={amp} />
          )}
        </div>
      </button>

      {/* PiP */}
      <button
        type="button"
        onClick={swap}
        className={[
          "absolute z-10 rounded-xl overflow-hidden border border-border shadow-lg",
          "transition-transform hover:scale-[1.02] active:scale-[0.98] bg-card/80 backdrop-blur",
          pipSizeClass,
          pipPositionClassName,
        ].join(" ")}
        aria-label="Toggle main and preview video"
      >
        <div className="w-full h-full">
          {main === "user" ? (
            <InterviewerView talking={talking} amp={amp} />
          ) : (
            <UserVideo
              stream={userStream}
              className="aspect-video"
              fit="cover"
            />
          )}
        </div>
      </button>

      {/* 하단 가이드 */}
      <div className="absolute left-3 bottom-3 px-2.5 py-1.5 rounded-md bg-black/45 text-white text-[11px] sm:text-xs">
        화면을 클릭하면 전환돼요{isTtsPlaying ? " (질문 읽는 중)" : ""}
      </div>
    </section>
  );
}
