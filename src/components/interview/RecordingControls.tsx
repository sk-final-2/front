"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  questionStarted: boolean;
  onAutoSubmit: (video: Blob) => void;
  onManualSubmit: (video: Blob) => void;
  stream: MediaStream | null;
}

export default function RecordingControls({
  questionStarted,
  onAutoSubmit,
  onManualSubmit,
  stream,
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

    recorder.start(); // 또는 recorder.start(1000) for chunk every 1s
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
        resolve(blob);
      };

      recorder.stop();
    });
  };

  // 🕒 질문 시작 시 타이머 + 녹화 시작
  useEffect(() => {
    if (questionStarted && stream) {
      startRecording();
      setTimeLeft(60);
      setCanSubmit(false);
      hasSubmitted.current = false; // ✅ 새로운 질문 시작할 때 초기화

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          if (prev === 55) {
            setCanSubmit(true);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current!);
    };
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
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="text-xl font-semibold">⏱️ {timeLeft}초</div>
      <button
        className={`px-6 py-2 rounded-lg transition-all
          ${canSubmit
            ? `cursor-pointer bg-blue-500 text-white border-blue-600 border-b-[4px]
            hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]
            active:border-b-[2px] active:brightness-90 active:translate-y-[2px]`
            : `bg-gray-300 text-gray-600 cursor-not-allowed`
          }`}
        onClick={handleManualSubmit}
        disabled={!canSubmit}
      >
        제출
      </button>
    </div>
  );
}
