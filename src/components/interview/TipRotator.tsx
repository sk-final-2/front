"use client";
import { useEffect, useState } from "react";

type Props = { tips: string[]; intervalMs?: number };

export default function TipRotator({ tips, intervalMs = 5000 }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!tips?.length) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % tips.length), intervalMs);
    return () => clearInterval(id);
  }, [tips, intervalMs]);

  if (!tips?.length) return null;

  return (
    <div className="flex items-center gap-3 min-h-[44px]">
      <span className="text-xl md:text-2xl">💡</span>
      <div aria-live="polite">
        <p className="font-semibold leading-none mb-1">면접 팁</p>
        <p className="text-sm md:text-base text-muted-foreground">{tips[idx]}</p>
      </div>
    </div>
  );
}
