"use client";

type Props = { totalSec: number; leftSec: number };

export default function TimeBar({ totalSec, leftSec }: Props) {
  const pct = Math.max(0, Math.min(100, totalSec > 0 ? (leftSec / totalSec) * 100 : 0));
  return (
    <div
      className="w-full h-3 md:h-3.5 rounded-md bg-accent border border-border overflow-hidden"
      role="progressbar"
      aria-label="남은 시간"
      aria-valuemin={0}
      aria-valuemax={totalSec}
      aria-valuenow={leftSec}
    >
      <div
        className="h-full bg-primary transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
