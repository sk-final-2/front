// components/tts/TtsComponent.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  text: string;
  autoPlay?: boolean;                // text 바뀌면 자동 재생할지
  lang?: string;                     // 기본 "ko-KR"
  rate?: number;                     // 0.1~10, 기본 1
  pitch?: number;                    // 0~2, 기본 1
  volume?: number;                   // 0~1, 기본 1
  onStart?: () => void;              // 재생 시작 콜백
  onEnd?: () => void;                // 재생 종료 콜백
  onError?: (err: unknown) => void;  // 오류 콜백
};

const TtsComponent: React.FC<Props> = ({
  text,
  autoPlay = true,
  lang = "ko-KR",
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  onError,
}) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 현재 발화 인스턴스는 매 재생 시 생성
  const buildUtterance = useMemo(() => {
    return () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;

      // ko-KR 우선 선택
      const korean = voices.find(v => v.lang === lang);
      if (korean) u.voice = korean;

      u.onstart = () => {
        setIsPlaying(true);
        onStart?.();
      };
      u.onend = () => {
        setIsPlaying(false);
        onEnd?.();
      };
      u.onerror = (e) => {
        setIsPlaying(false);
        onError?.(e);
      };
      return u;
    };
  }, [text, lang, rate, pitch, volume, voices, onStart, onEnd, onError]);

  const play = () => {
    try {
      if (!synthRef.current) return;
      // 이전 발화 중이면 취소 후 시작
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      const u = buildUtterance();
      synthRef.current.speak(u);
    } catch (e) {
      onError?.(e);
    }
  };

  const stop = () => {
    if (!synthRef.current) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  // 초기화: voice 목록 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;

    const loadVoices = () => {
      const list = synth.getVoices();
      setVoices(list);
      setReady(true);
    };

    // 일부 브라우저는 즉시 로드, 일부는 이벤트 필요
    if (synth.onvoiceschanged === null) {
      synth.addEventListener("voiceschanged", loadVoices);
    } else {
      synth.onvoiceschanged = loadVoices;
    }
    // 최초 시도
    loadVoices();

    return () => {
      if (synth.onvoiceschanged === null) {
        synth.removeEventListener("voiceschanged", loadVoices);
      } else {
        synth.onvoiceschanged = null;
      }
      synth.cancel();
    };
  }, []);

  // text 변경 시 자동재생
  useEffect(() => {
    if (!ready) return;
    if (!autoPlay) return;
    if (!text) return;
    // 사용자 제스처가 없으면 첫 실행이 막힐 수 있음 → 실패 시 버튼으로 유도
    try {
      play();
    } catch (e) {
      onError?.(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ready, autoPlay]);

  return (
    <div className="w-full">
      {/* 필요하면 현재 질문 텍스트도 같이 표시 */}
      {/* <span className="text-sm text-gray-500">{text}</span> */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          className="rounded-xl px-4 h-10 bg-green-500 text-white hover:bg-green-600"
          onClick={play}
          aria-label="TTS 재생"
        >
          재생
        </button>
        <button
          type="button"
          className="rounded-xl px-4 h-10 bg-gray-300 hover:bg-gray-400"
          onClick={stop}
          aria-label="TTS 정지"
          disabled={!isPlaying}
        >
          정지
        </button>
      </div>
    </div>
  );
};

export default TtsComponent;
