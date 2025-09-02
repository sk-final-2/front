"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  totalSec: number;
  leftSec: number;
  visible?: boolean;
  reserveSpace?: boolean;
  fadeMs?: number;
  smooth?: boolean;
};

export default function TimeBar({
  totalSec,
  leftSec,
  visible = true,
  reserveSpace = true,
  fadeMs = 300,
  smooth = true,
}: Props) {
  const pct = Math.max(0, Math.min(100, (leftSec / Math.max(1, totalSec)) * 100));

  // ✅ 부드러운 진행: 질문 시작(보이기)마다 100%→0%로 선형 전환
  const [playKey, setPlayKey] = useState(0);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!visible) return;
    // 보일 때마다 애니메이션을 리셋
    setPlaying(false);
    // 다음 프레임에서 width 0%로 전환 → transition 시작
    rafRef.current = requestAnimationFrame(() => setPlaying(true));
    setPlayKey((k) => k + 1); // key로도 안전하게 재시작
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, totalSec]);

  const innerStyle: React.CSSProperties = smooth
    ? {
        width: playing ? "0%" : "100%",
        transitionProperty: "width",
        transitionDuration: `${totalSec * 1000}ms`,
        transitionTimingFunction: "linear",
        willChange: "width",
      }
    : {
        width: `${pct}%`,
        transition: "width 300ms ease-out",
      };

  const bar = (
    <div
      className="w-full h-3 md:h-3.5 rounded-md bg-accent border border-border overflow-hidden"
      role="progressbar"
      aria-label="남은 시간"
      aria-valuemin={0}
      aria-valuemax={totalSec}
      aria-valuenow={leftSec}
    >
      <div key={playKey} className="h-full bg-primary/80" style={innerStyle} />
    </div>
  );
  if (!reserveSpace) {
    // 공간까지 없앰(살짝 위아래 점프 가능)
    return (
      <div
        className={`transition-opacity`}
        style={{ transitionDuration: `${fadeMs}ms`, opacity: visible ? 1 : 0 }}
        aria-hidden={!visible}
      >
        {visible ? bar : null}
      </div>
    );
  }

  // 공간은 유지하면서 시각적으로만 페이드
  return (
    <div
      className={`transition-opacity`}
      style={{ transitionDuration: `${fadeMs}ms`, opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      {bar}
    </div>
  );
}
