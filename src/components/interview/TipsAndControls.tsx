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
  // (옵션) 시간바 연동용
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
    <div className="rounded-xl border bg-card p-4 md:p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <TipRotator tips={tips} />
      <div className="md:min-w-[260px]">
        {showControls ? (
          <RecordingControls
            stream={stream}
            questionStarted={questionStarted}
            onAutoSubmit={onAutoSubmit}
            onManualSubmit={onManualSubmit}
            onTimeInit={onTimeInit}
            onTimeTick={onTimeTick}
          />
        ) : null}
      </div>
    </div>
  );
}
