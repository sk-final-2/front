"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  questionStarted: boolean;
  onAutoSubmit: (video: Blob) => void;
  onManualSubmit: (video: Blob) => void;
  stream: MediaStream | null;
  onTimeInit?: (totalSec: number) => void; // ✅ 추가
  onTimeTick?: (leftSec: number) => void; // ✅ 추가
}

export default function RecordingControls({
  questionStarted,
  onAutoSubmit,
  onManualSubmit,
  stream,
  onTimeInit,
  onTimeTick,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [canSubmit, setCanSubmit] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmitted = useRef(false); // ✅ 중복 제출 방지용 ref
  const startedRef = useRef(false);

  // ✅ 콜백 ref는 null로 초기화
  const initCbRef = useRef<((totalSec: number) => void) | null>(null);
  const tickCbRef = useRef<((leftSec: number) => void) | null>(null);

  // 최신 콜백을 ref에 저장
  useEffect(() => {
    initCbRef.current = onTimeInit ?? null;
  }, [onTimeInit]);

  useEffect(() => {
    tickCbRef.current = onTimeTick ?? null;
  }, [onTimeTick]);

  // 🔴 녹화 시작
  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.start(100); // 또는 recorder.start(1000) for chunk every 1s
  };

  // 🟢 녹화 종료 및 Blob 반환
  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob());
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        console.log("🎬 자동제출용 blob 생성 완료", blob);
        resolve(blob);
      };

      // ✅ ondataavailable 수집 완료 보장 후 stop
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // ✅ setTimeout을 활용해서 stop()을 살짝 지연시킴
      setTimeout(() => {
        recorder.stop();
      }, 100); // 100ms 정도 지연
    });
  };

  // 🕒 질문 시작 시 타이머 + 녹화 시작
  useEffect(() => {
    if (!questionStarted || !stream) return;
    if (startedRef.current) return;
    startedRef.current = true;

    startRecording();
    const TOTAL = 60;
    setTimeLeft(TOTAL);
    setCanSubmit(false);
    hasSubmitted.current = false;

    // ✅ 렌더 단계가 아닌 이펙트에서만 부모 상태 갱신
    initCbRef.current?.(TOTAL);
    tickCbRef.current?.(TOTAL);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        tickCbRef.current?.(next);
        if (prev <= 1) {
          clearInterval(id);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 55) setCanSubmit(true);
        return next;
      });
    }, 1000);
    timerRef.current = id;

    return () => {
      clearInterval(id);
      startedRef.current = false;
    };
    // ⛔ onTimeInit/onTimeTick은 deps에서 제외 (ref로 대체)
  }, [questionStarted, stream]);

  // 자동 제출
  const handleAutoSubmit = async () => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const blob = await stopRecording();
    onAutoSubmit(blob);
  };

  // 🧍 수동 제출
  const handleManualSubmit = async () => {
    if (hasSubmitted.current) return; // ✅ 중복 방지
    hasSubmitted.current = true;
    clearInterval(timerRef.current!);
    const blob = await stopRecording();
    onManualSubmit(blob);
  };

  return (
    <div className="h-10 flex items-center justify-end gap-3">
      <div className="text-lg font-semibold min-w-[64px] text-right leading-none">
        {timeLeft}초
      </div>
      <button
        className={`h-10 px-4 rounded-lg transition-all
        ${
          canSubmit
            ? `cursor-pointer bg-primary/80 text-white
                border-b-[3px] border-primary/80 shadow-sm
                hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[5px]
                active:border-b-[2px] active:brightness-95 active:translate-y-[2px]`
            : `bg-muted text-muted-foreground cursor-not-allowed`
        }`}
        onClick={handleManualSubmit}
        disabled={!canSubmit}
      >
        제출
      </button>
    </div>
  );
}
