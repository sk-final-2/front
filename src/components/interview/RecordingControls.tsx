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
  if (questionStarted && stream) {
    startRecording();
    const TOTAL = 60;                   // 기존 60 유지
    setTimeLeft(TOTAL);
    setCanSubmit(false);
    hasSubmitted.current = false;

    // ✅ 시간바 초기화/첫 틱 알림
    onTimeInit?.(TOTAL);
    onTimeTick?.(TOTAL);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1);
        onTimeTick?.(next);            // ✅ 매초 알림
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        if (prev === 55) setCanSubmit(true);
        return next;
      });
      return;
    }, 1000);
  }
  return () => clearInterval(timerRef.current!);
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
    <div className="flex flex-row items-center gap-2 mt-4">
      <div className="text-xl font-semibold">{timeLeft}초</div>
      <button
        className={`px-6 py-2 rounded-lg transition-all
        ${
          canSubmit
            ? `cursor-pointer bg-primary text-primary-foreground 
                border-b-[4px] border-primary shadow-sm
                hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
                active:border-b-[2px] active:brightness-90 active:translate-y-[2px]`
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
