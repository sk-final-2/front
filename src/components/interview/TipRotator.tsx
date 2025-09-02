"use client";
import { useEffect, useRef, useState } from "react";

type Props = { tips: string[]; intervalMs?: number };

export default function TipRotator({ tips, intervalMs = 5000 }: Props) {
  const [idx, setIdx] = useState(0);
  const tipsRef = useRef(tips);
  tipsRef.current = tips; // 항상 최신 배열 가리키기

  useEffect(() => {
    if (!tipsRef.current?.length || tipsRef.current.length < 2) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % tipsRef.current.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [tips.length, intervalMs]);

  if (!tipsRef.current?.length) return null;

  return (
    <div className="flex items-center gap-3 min-h-[44px]">
      <span className="text-xl md:text-2xl">💡</span>
      <div aria-live="polite">
        <p className="font-semibold leading-none mb-1">면접 팁</p>
        <p className="text-sm md:text-base text-muted-foreground">{tipsRef.current[idx]}</p>
      </div>
    </div>
  );
}
