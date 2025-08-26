import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * ReAISplitHero – Split to Two-Line Slogan
 * - 처음엔 중앙에 "Re:AI" 한 줄
 * - 스크롤하면 "Re"와 "AI"가 좌우로 갈라지며 동시에
 *   중앙에는 큰 두 줄의 슬로건이 교차 페이드 인
 *   1) Rehearse with AI
 *   2) Reinforce with AI
 */
export default function ReAISplitHero() {
  const prefersReduced = useReducedMotion();
  const stickyRef = useRef<HTMLDivElement>(null);

  // ===== Tunable knobs =====
  // 더 오래 보이게 하려면 stickyVh를 키우세요 (예: 260~300)
  const stickyVh = 500; // sticky 구간 높이 (vh)
  // 분리/등장 타이밍 (0~1)
  const splitStart = 0.15; // Re:AI 분리 시작
  const splitEnd = 0.55;   // 분리 마무리(이후 흐려짐 시작)
  const sloganStart = 0.35; // 슬로건 등장 시작
  const sloganFull = 0.65;  // 슬로건 완전 노출

  // Sticky 구간 스크롤 진행도
  const { scrollYProgress } = useScroll({ target: stickyRef, offset: ["start start", "end start"] });

  // 좌우 분리 이동값 — 전체 진행의 더 이른 구간에서 끝나도록 조정
  const reX = useTransform(scrollYProgress, [0, splitStart, splitEnd], [0, -140, -220]);
  const aiX = useTransform(scrollYProgress, [0, splitStart, splitEnd], [0, 140, 220]);

  // 크기/블러/콜론 투명도
  const size = useTransform(scrollYProgress, [0, splitEnd], [1, 0.85]);
  const gap = useTransform(scrollYProgress, [0, splitEnd], [0, 12]);
  const colonOpacity = useTransform(scrollYProgress, [0, splitStart * 0.8, splitEnd * 0.9], [1, 0.3, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 2]);

  // 스플릿 타이포( Re | AI )의 사라짐 — 조금 더 일찍 사라지게
  const splitOpacity = useTransform(scrollYProgress, [0, splitEnd, sloganFull], [1, 0.7, 0]);

  // 중앙 두 줄 슬로건 — 더 일찍, 더 오래 보여주기
  const sloganOpacity = useTransform(scrollYProgress, [sloganStart, sloganFull, 1], [0, 1, 1]);
  const sloganY = useTransform(scrollYProgress, [sloganStart, sloganFull], [20, 0]);

  const rm = (val: any, fb: any) => (prefersReduced ? fb : val);

  return (
    <main className="min-h-[320vh] bg-white text-neutral-900">
      {/* Sticky stage */}
      <section ref={stickyRef} className="relative" style={{ height: `${stickyVh}vh` }}>
        <div className="sticky top-0 h-[100svh] flex items-center justify-center overflow-hidden">
          {/* subtle bg */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 size-[80vmax] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-gray-200 to-gray-50" />
          </div>

          {/* Split word (fades out as slogans fade in) */}
          <motion.div
            style={{ scale: rm(size, 1), filter: rm(blur, "none"), opacity: rm(splitOpacity, 1) }}
            className="relative flex items-end select-none"
            aria-label="Re colon AI brand lockup"
          >
            {/* Left: Re */}
            <motion.span
              style={{ x: rm(reX, 0), marginRight: rm(gap, 0) }}
              className="font-extrabold tracking-tight leading-none"
            >
              <span className="text-[11vw] md:text-[9vw] lg:text-[8vw]">Re</span>
            </motion.span>

            {/* Colon */}
            <motion.span
              style={{ opacity: rm(colonOpacity, 1) }}
              className="font-extrabold leading-none text-[11vw] md:text-[9vw] lg:text-[8vw]"
            >
              :
            </motion.span>

            {/* Right: AI */}
            <motion.span
              style={{ x: rm(aiX, 0), marginLeft: rm(gap, 0) }}
              className="font-extrabold tracking-tight leading-none"
            >
              <span className="text-[11vw] md:text-[9vw] lg:text-[8vw]">AI</span>
            </motion.span>
          </motion.div>

          {/* Centered two-line slogans */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: rm(sloganOpacity, 1) }}
            aria-hidden
          >
            <motion.div style={{ y: rm(sloganY, 0) }} className="text-center select-none leading-[1.05]">
              <div className="text-[9vw] md:text-[6vw] lg:text-[5vw] font-medium">Rehearse with AI</div>
              <div className="text-[9vw] md:text-[6vw] lg:text-[5vw] font-medium">Reinforce with AI</div>
            </motion.div>
          </motion.div>

          {/* Helper microcopy */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center text-xs opacity-60">
            <span>Scroll</span>
          </div>
        </div>
      </section>

      {/* Content after hero */}
      <section className="mx-auto max-w-5xl px-6 py-28 md:py-36 space-y-12">
        <h2 className="text-2xl md:text-4xl font-semibold">What is Re:AI?</h2>
        <p className="text-base md:text-lg leading-relaxed text-neutral-700">
          스크롤 구간을 길게(stickyVh) 잡고, 애니메이션이 더 일찍 완성되도록 맵핑을 조정했습니다. 필요하면 수치만 바꿔서 맞추세요.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-neutral-200 p-6 shadow-sm">
              <div className="text-sm uppercase tracking-widest mb-2">Feature {i}</div>
              <div className="text-lg font-medium">Short headline</div>
              <p className="mt-3 text-sm text-neutral-600">Brief description explaining how this helps candidates prepare and improve.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
