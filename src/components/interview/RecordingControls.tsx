"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  questionStarted: boolean;
  onAutoSubmit: (video: Blob) => void;
  onManualSubmit: (video: Blob) => void;
  stream: MediaStream | null;
  onTimeInit?: (totalSec: number) => void;
  onTimeTick?: (leftSec: number) => void;
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
  const timerRef = useRef<number | null>(null); // ✅ browser type
  const hasSubmitted = useRef(false);
  const startedRef = useRef(false);

  const initCbRef = useRef<((totalSec: number) => void) | null>(null);
  const tickCbRef = useRef<((leftSec: number) => void) | null>(null);

  useEffect(() => { initCbRef.current = onTimeInit ?? null; }, [onTimeInit]);
  useEffect(() => { tickCbRef.current = onTimeTick ?? null; }, [onTimeTick]);

  // ✅ 안전한 시작: timeslice 제거 + 코덱/비트레이트(가능시)
  const startRecording = () => {
    if (!stream) return;

    // 혹시 살아있던 레코더가 있다면 정리
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }

    chunksRef.current = [];

    // 브라우저가 지원하지 않으면 mimeType는 무시됨
    const options: MediaRecorderOptions = {
      mimeType: "video/webm;codecs=vp9,opus",
      audioBitsPerSecond: 128_000,
      videoBitsPerSecond: 2_000_000,
    };

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, options);
    } catch {
      // fallback (브라우저가 vp9 미지원 등)
      recorder = new MediaRecorder(stream);
    }

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) chunksRef.current.push(e.data);
    };

    // ❌ recorder.start(100) 금지
    recorder.start(); // ✅ 한 번에 기록 (마지막에 stop 시 최종 조각 전달)
    mediaRecorderRef.current = recorder;
  };

  // ✅ 안전한 정지: 마지막 조각까지 받은 뒤 Blob 생성
  const stopRecording = (): Promise<Blob> =>
    new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob());
        return;
      }

      const handleStop = () => {
        recorder.removeEventListener("stop", handleStop);
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = []; // 다음 녹화 대비 초기화
        resolve(blob);
      };

      recorder.addEventListener("stop", handleStop);
      // ❗ ondataavailable을 여기서 재정의하지 말 것
      recorder.stop(); // stop 호출 → 마지막 dataavailable → stop 순으로 들어옴
    });

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

    initCbRef.current?.(TOTAL);
    tickCbRef.current?.(TOTAL);

    let left = TOTAL;
    const id = window.setInterval(() => {
      const next = Math.max(0, left - 1);
      setTimeLeft(next);
      tickCbRef.current?.(next);

      if (left === 55) setCanSubmit(true);
      if (left <= 1) {
        window.clearInterval(id);
        timerRef.current = null;
        handleAutoSubmit();
      }

      left = next;
    }, 1000);

    timerRef.current = id;

    // cleanup (질문 바뀜/언마운트)
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      startedRef.current = false;
    };
  }, [questionStarted, stream]);

  // 자동 제출
  const handleAutoSubmit = async () => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    const blob = await stopRecording();
    onAutoSubmit(blob);
  };

  // 수동 제출
  const handleManualSubmit = async () => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const blob = await stopRecording();
    onManualSubmit(blob);
  };

  // 컴포넌트 완전 언마운트 시 미디어레코더 정리
  useEffect(() => {
    return () => {
      try {
        const r = mediaRecorderRef.current;
        if (r && r.state !== "inactive") r.stop();
      } catch {}
    };
  }, []);

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
            : `bg-accent text-accent-foreground cursor-not-allowed`
        }`}
        onClick={handleManualSubmit}
        disabled={!canSubmit}
      >
        제출
      </button>
    </div>
  );
}
