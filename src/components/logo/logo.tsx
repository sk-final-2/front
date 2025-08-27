"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

/**
 * import ReAIHeaderHeroLogo from "@/components/logo/logo";
 * <ReAIHeaderHeroLogo
 *  href="/"
 *  size={28}
 *  className="text-foreground"
 *  splitDurationMs={750}
 *  sloganRevealMs={600}
 * />
 */

/**
 * ReAIHeaderHeroLogo – Re 고정, ":AI" 오른쪽 슬라이드, 슬로건 L→R 와이프
 * - 요청대로: 기본은 로고가 **사라지지 않습니다** (fadeOutLogo=false)
 * - 필요 시만 로고를 페이드아웃하려면 fadeOutLogo=true 로 사용하세요
 */
export type ReAIHeaderHeroLogoProps = {
  size?: number | string;        // 로고 폰트 크기 (기본 1.75rem)
  baseDistance?: number;         // 추가 가산 이동(px) (기본 12)
  autoDistance?: boolean;        // 슬로건 폭 기반 거리 자동 보정 (기본 true)
  minGap?: number;               // Re와 슬로건 사이 여백(px) (기본 8)
  className?: string;
  href?: string;
  active?: boolean;              // 제어형 (없으면 hover/focus)
  ariaLabel?: string;
  upperText?: string;
  lowerText?: string;
  // 타이밍 (느긋하게 기본값 조정)
  splitDurationMs?: number;      // ":AI" 이동 시간 (기본 650ms)
  sloganDelayMs?: number;        // 슬로건 시작 지연 (기본 200ms)
  sloganRevealMs?: number;       // 왼→오 와이프 시간 (기본 550ms)
  fadeAfterRevealMs?: number;    // 와이프 후 페이드 시작 지연 (기본 200ms)
  fadeDurationMs?: number;       // 로고 사라지는 시간 (기본 260ms)
  fadeOutLogo?: boolean;         // ✅ 로고를 사라지게 할지 여부 (기본 false)
};

export default function ReAIHeaderHeroLogo({
  size = "1.75rem",
  baseDistance = 12,
  autoDistance = true,
  minGap = 8,
  className = "",
  href,
  active,
  ariaLabel = "Re:AI",
  upperText = "Rehearse with AI",
  lowerText = "Reinforce with AI",
  splitDurationMs = 650,
  sloganDelayMs = 200,
  sloganRevealMs = 550,
  fadeAfterRevealMs = 200,
  fadeDurationMs = 260,
  fadeOutLogo = false,
}: ReAIHeaderHeroLogoProps) {
  const prefersReduced = useReducedMotion();
  const [hovered, setHovered] = React.useState(false);
  const isActive = active ?? hovered;

  // ===== 실제 폭 측정 (겹침/잘림 방지) =====
  const reRef = React.useRef<HTMLSpanElement>(null);
  const slogansRef = React.useRef<HTMLSpanElement>(null);
  const [reWidth, setReWidth] = React.useState(0);
  const [slogansWidth, setSlogansWidth] = React.useState(0);

  const measure = React.useCallback(() => {
    if (reRef.current) setReWidth(Math.ceil(reRef.current.getBoundingClientRect().width));
    if (slogansRef.current) setSlogansWidth(Math.ceil(slogansRef.current.getBoundingClientRect().width));
  }, []);

  React.useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      if (reRef.current) ro.observe(reRef.current);
      if (slogansRef.current) ro.observe(slogansRef.current);
      return () => ro.disconnect();
    }
  }, [measure, upperText, lowerText, size, className]);

  // ":AI"가 이동해야 하는 거리 = (슬로건 전체 폭 + 좌우 여백*2) + baseDistance
  const desiredGap = slogansWidth + minGap * 2;
  const computedDistance = autoDistance ? Math.max(baseDistance, desiredGap) : baseDistance;
  const shift = prefersReduced ? 0 : computedDistance;

  // 슬로건은 Re 바로 오른쪽(reWidth + minGap)에서 왼→오로 와이프
  const sloganLeftPx = reWidth + minGap;
  const totalFadeDelaySec = (sloganDelayMs + sloganRevealMs + fadeAfterRevealMs) / 1000;

  const Logo = (
    <span
      className={`relative inline-flex items-end leading-none select-none whitespace-nowrap ${className}`}
      style={{ fontSize: typeof size === "number" ? `${size}px` : size }}
    >
      {/* Re (고정) */}
      <motion.span
        ref={reRef}
        aria-hidden
        initial={false}
        animate={{ x: 0, opacity: isActive && fadeOutLogo ? 0 : 1 }}
        transition={{
          opacity: { delay: isActive && fadeOutLogo ? totalFadeDelaySec : 0, duration: fadeDurationMs / 1000 },
        }}
        className="font-extrabold tracking-tight z-20"
      >
        Re
      </motion.span>

      {/* ":AI" 그룹 (오른쪽 이동 → 필요 시 페이드) */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: isActive ? shift : 0, opacity: isActive && fadeOutLogo ? 0 : 1 }}
        transition={{
          x: { type: "tween", ease: [0.22, 1, 0.36, 1], duration: splitDurationMs / 1000 },
          opacity: { delay: isActive && fadeOutLogo ? totalFadeDelaySec : 0, duration: fadeDurationMs / 1000 },
        }}
        className="inline-flex items-end z-20"
      >
        <span className="px-[0.12em] font-extrabold">:</span>
        <span className="font-extrabold tracking-tight">AI</span>
      </motion.span>

      {/* Center slogans - left anchored next to Re, reveal L→R via clipPath */}
      <motion.span
        ref={slogansRef}
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-[55%] flex flex-col items-start text-muted-foreground z-10"
        style={{ left: sloganLeftPx, clipPath: "inset(0 100% 0 0)" }}
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0,
          clipPath: isActive ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
        }}
        transition={{
          opacity: { delay: sloganDelayMs / 1000, duration: 0.2 },
          clipPath: { delay: sloganDelayMs / 1000, duration: sloganRevealMs / 1000, ease: "easeOut" },
        }}
      >
        <span className="text-[0.58em] uppercase tracking-[0.18em] leading-[1.08]">{upperText}</span>
        <span className="text-[0.58em] uppercase tracking-[0.18em] leading-[1.08]">{lowerText}</span>
      </motion.span>

      {/* SR-only 라벨 */}
      <span className="sr-only">{ariaLabel}</span>
    </span>
  );

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  } as const;

  const wrapperCls = "inline-flex items-center overflow-visible";

  return href ? (
    <Link href={href} aria-label={ariaLabel} className={wrapperCls} {...handlers}>
      {Logo}
    </Link>
  ) : (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`${wrapperCls} bg-transparent border-0 p-0 m-0 cursor-pointer`}
      {...handlers}
    >
      {Logo}
    </button>
  );
}

/**
 * Usage
 * <ReAIHeaderHeroLogo href="/" size={28} className="text-foreground" />
 * - 로고는 기본적으로 **사라지지 않음**(fadeOutLogo=false)
 * - 더 느리게: splitDurationMs={750} sloganRevealMs={600}
 * - 필요 시만 사라지게: fadeOutLogo
 */
