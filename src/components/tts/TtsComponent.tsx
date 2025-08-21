// components/tts/TtsComponent.tsx
"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";

type Props = {
  text: string;
  autoPlay?: boolean;                // text 바뀌면 자동 재생
  lang?: string;                     // 기본 "ko-KR"
  rate?: number;                     // 속도 (기본 1)
  pitch?: number;                    // 음높이 (기본 1)
  volume?: number;                   // 볼륨 (기본 1)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
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

  // 매번 새로운 발화 객체 생성
  const buildUtterance = useMemo(() => {
    return () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;

      // 한국어 보이스 우선
      const korean = voices.find((v) => v.lang === lang);
      if (korean) u.voice = korean;

      u.onstart = () => onStart?.();
      u.onend = () => onEnd?.();
      u.onerror = (e) => onError?.(e);

      return u;
    };
  }, [text, lang, rate, pitch, volume, voices, onStart, onEnd, onError]);

  const play = () => {
    try {
      const synth = synthRef.current;
      if (!synth) return;
      if (synth.speaking) synth.cancel(); // 기존 발화 중단
      synth.speak(buildUtterance());
    } catch (e) {
      onError?.(e);
    }
  };

  // 초기 voice 목록 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;

    const loadVoices = () => {
      setVoices(synth.getVoices());
      setReady(true);
    };

    synth.addEventListener("voiceschanged", loadVoices);
    loadVoices();

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
      synth.cancel();
    };
  }, []);

  // text 변경 → 자동재생
  useEffect(() => {
    if (!ready) return;
    if (!autoPlay) return;
    if (!text) return;
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ready, autoPlay]);

  return null; // 완전히 UI 없는 컴포넌트
};

export default TtsComponent;
