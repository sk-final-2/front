// components/tts/TtsComponent.tsx
"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";

type Props = {
  text: string;
  autoPlay?: boolean;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;

  /** 🔵 추가: 토큰 경계마다 0~1 사이의 추정 에너지 전달 */
  onEnergy?: (amp: number) => void;
};

type SSBoundaryEvent = SpeechSynthesisEvent & { charLength?: number };

function guessEnergy(token = "") {
  const w = token.toLowerCase().trim();
  if (!w) return 0.15;
  if (/[!?,.]/.test(w)) return 0.35;
  if (/(아|a)/.test(w)) return 0.9;
  if (/(어|eo)/.test(w)) return 0.7;
  if (/(오|우|o|u)/.test(w)) return 0.6;
  if (/(이|i|ee)/.test(w)) return 0.45;
  if (/(ㅋ|ㅌ|ch|k|t)/.test(w)) return 0.55;
  if (/\b(m|b|p|ㅁ|ㅂ|ㅍ)\b/.test(w)) return 0.2;
  return 0.5;
}

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
  onEnergy,
}) => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ready, setReady] = useState(false);

  const buildUtterance = useMemo(() => {
    return () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;

      const korean = voices.find((v) => v.lang === lang);
      if (korean) u.voice = korean;

      u.onstart = () => onStart?.();
      u.onend = () => {
        onEnergy?.(0); // 종료 시 0으로 하강
        onEnd?.();
      };
      u.onerror = (e) => onError?.(e as unknown);

      // 🔵 핵심: 경계 콜백으로 에너지 추정
      u.onboundary = (e: SpeechSynthesisEvent) => {
        try {
          // charLength가 없는 브라우저 대비: 주변 몇 글자 샘플
          const len = (e as SSBoundaryEvent).charLength ?? 6;
          const start = e.charIndex ?? 0;
          const token = text.slice(start, start + len);
          const energy = guessEnergy(token);
          onEnergy?.(energy);
        } catch {
          onEnergy?.(0.4);
        }
      };

      return u;
    };
  }, [text, lang, rate, pitch, volume, voices, onStart, onEnd, onError, onEnergy]);

  const play = () => {
    try {
      const synth = synthRef.current;
      if (!synth) return;
      if (synth.speaking) synth.cancel();
      synth.speak(buildUtterance());
    } catch (e) {
      onError?.(e);
    }
  };

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
    if (!ready || !autoPlay || !text) return;
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ready, autoPlay]);

  return null; // UI 없음
};

export default TtsComponent;
