"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  questionStarted: boolean;
  onAutoSubmit: (video: Blob) => void;
  onManualSubmit: (video: Blob) => void;
  stream: MediaStream | null; // UserVideo 컴포넌트에서 전달받은 스트림
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

  // 🔴 녹화 시작
  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    recorder.start();
  };

  // ⏹ 녹화 종료 및 Blob 반환
  const stopRecording = (): Blob => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    return blob;
  };

  // 🔁 질문 시작되면 타이머 + 녹화
  useEffect(() => {
    if (questionStarted && stream) {
      startRecording();
      setTimeLeft(60);
      setCanSubmit(false);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            const blob = stopRecording();
            onAutoSubmit(blob); // 자동 제출
            return 0;
          }
          if (prev === 55) {
            setCanSubmit(true); // 5초 경과 후 제출 가능
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current!);
    };
  }, [questionStarted, stream]);

  // 🟡 수동 제출 클릭
  const handleManualSubmit = () => {
    clearInterval(timerRef.current!);
    const blob = stopRecording();
    onManualSubmit(blob);
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="text-xl font-semibold">
        ⏱️ {timeLeft}초
      </div>
      <button
        className={`px-4 py-2 rounded ${
          canSubmit ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
        }`}
        onClick={handleManualSubmit}
        disabled={!canSubmit}
      >
        제출
      </button>
    </div>
  );
}
