"use client";

import TipRotator from "./TipRotator";
import RecordingControls from "@/components/interview/RecordingControls";

type Props = {
  tips: string[];
  showControls: boolean;
  stream: MediaStream | null;
  questionStarted: boolean;
  onAutoSubmit: (blob: Blob) => void | Promise<void>;
  onManualSubmit: (blob: Blob) => void | Promise<void>;
  onTimeInit?: (total: number) => void;
  onTimeTick?: (left: number) => void;
};

export default function TipsAndControls({
  tips,
  showControls,
  stream,
  questionStarted,
  onAutoSubmit,
  onManualSubmit,
  onTimeInit,
  onTimeTick,
}: Props) {
  return (
    <div
      className="
        rounded-xl shadow-sm bg-card p-4 md:p-5 shadow-sm
        grid grid-cols-[1fr_auto] items-center gap-4
      "
    >
      {/* 좌측: 팁 */}
      <TipRotator tips={tips} />

      {/* 우측: 컨트롤 영역 (항상 같은 폭/높이 유지) */}
      <div className="justify-self-end w-[280px]">
        {showControls ? (
          <RecordingControls
            stream={stream}
            questionStarted={questionStarted}
            onAutoSubmit={onAutoSubmit}
            onManualSubmit={onManualSubmit}
            onTimeInit={onTimeInit}
            onTimeTick={onTimeTick}
          />
        ) : (
          // 레이아웃 점프 방지용 placeholder (컨트롤과 동일 높이)
          <div className="h-10" />
        )}
      </div>
    </div>
  );
}
