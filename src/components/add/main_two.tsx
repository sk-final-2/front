import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * ReAISplitHero – LR split → center handoff (no scroll down)
 *
 * 요구사항 반영:
 * - 중앙 "Re:AI"가 좌/우로 갈라짐
 * - 갈라짐과 동시에/직후, **가운데 영역에 팀원 메인 컴포넌트가 등장** (아래로 내려가지 않음)
 * - 스크롤 진행은 계속 hero 안에서만 일어나고, 팀원 메인이 hero 중앙을 점유
 * - 필요 시 팀원 메인이 완전히 takeover 하도록 페이드/스케일 튜닝 가능
 */
export default function ReAISplitHero() {
  const prefersReduced = useReducedMotion();
  const stickyRef = useRef<HTMLDivElement>(null);

  // ===== Tunable knobs =====
  const stickyVh = 420;    // sticky 구간 높이 (vh)
  const splitStart = 0.15; // Re:AI 분리 시작
  const splitEnd = 0.55;   // 분리 마무리
  const fadeOutEnd = 0.7;  // Re/AI 타이포가 완전히 사라지는 시점

  // 중앙 컨텐츠(팀원 메인) 등장 타이밍
  const centerInStart = 0.48; // 언제부터 보이기 시작할지 (splitEnd 근처 권장)
  const centerInFull = 0.62;  // 완전히 보이는 시점

  // Sticky 구간 스크롤 진행도
  const { scrollYProgress } = useScroll({ target: stickyRef, offset: ["start start", "end start"] });

  // 좌우 분리 이동값
  const reX = useTransform(scrollYProgress, [0, splitStart, splitEnd], [0, -140, -220]);
  const aiX = useTransform(scrollYProgress, [0, splitStart, splitEnd], [0, 140, 220]);

  // 크기/블러/콜론 투명도
  const size = useTransform(scrollYProgress, [0, splitEnd], [1, 0.85]);
  const gap = useTransform(scrollYProgress, [0, splitEnd], [0, 12]);
  const colonOpacity = useTransform(scrollYProgress, [0, splitStart * 0.8, splitEnd * 0.95], [1, 0.3, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], [0, 2]);

  // 스플릿 타이포 페이드 아웃
  const splitOpacity = useTransform(scrollYProgress, [0, splitEnd, fadeOutEnd], [1, 0.7, 0]);

  // 배경 그라데이션: 아래 컨텐츠가 아니라 중앙 컨텐츠에 집중하도록 유지
  const backdropOpacity = useTransform(scrollYProgress, [0, 1], [0.16, 0.1]);

  // ===== Center (team main) reveal =====
  // 가운데 컨테이너가 서서히 나타나고 살짝 확대되며 자리를 차지
  const centerOpacity = useTransform(scrollYProgress, [centerInStart, centerInFull], [0, 1]);
  const centerScale = useTransform(scrollYProgress, [centerInStart, centerInFull], [0.98, 1]);
  // 필요하면 위/아래에서 슬라이드되어 들어오게도 가능 (여기선 페이드/스케일만 적용)

  const rm = (val: any, fb: any) => (prefersReduced ? fb : val);

  return (
    <main className="bg-white text-neutral-900">
      {/* ================= HERO (Sticky) ================= */}
      <section ref={stickyRef} className="relative" style={{ height: `${stickyVh}vh` }}>
        <div className="sticky top-0 h-[100svh] flex items-center justify-center overflow-hidden">
          {/* soft background */}
          <motion.div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute -top-1/3 left-1/2 -translate-x-1/2 size-[80vmax] rounded-full blur-3xl bg-gradient-to-br from-gray-200 to-gray-50"
              style={{ opacity: rm(backdropOpacity, 0.14) }}
            />
          </motion.div>

          {/* Re:AI split (좌우) and fade out */}
          <motion.div
            style={{ scale: rm(size, 1), filter: rm(blur, "none"), opacity: rm(splitOpacity, 1) }}
            className="relative flex items-end select-none"
            aria-label="Re colon AI brand lockup"
          >
            <motion.span style={{ x: rm(reX, 0), marginRight: rm(gap, 0) }} className="font-extrabold tracking-tight leading-none">
              <span className="text-[11vw] md:text-[9vw] lg:text-[8vw]">Re</span>
            </motion.span>
            <motion.span style={{ opacity: rm(colonOpacity, 1) }} className="font-extrabold leading-none text-[11vw] md:text-[9vw] lg:text-[8vw]">:</motion.span>
            <motion.span style={{ x: rm(aiX, 0), marginLeft: rm(gap, 0) }} className="font-extrabold tracking-tight leading-none">
              <span className="text-[11vw] md:text-[9vw] lg:text-[8vw]">AI</span>
            </motion.span>
          </motion.div>

          {/* ===== Center handoff mount point (팀원 메인) ===== */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: rm(centerOpacity, 1), scale: rm(centerScale, 1) }}
            aria-label="Team main handoff"
          >
            {/* ⬇️ 여기에 팀원 메인 컴포넌트를 꽂아 넣으세요. */}
            {/* 예: <TeamMain />  */}
            <div className="w-full max-w-6xl px-6">
              <div className="rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-2">[Mount Team Main Here]</h2>
                <p className="text-neutral-600 md:text-lg">Re:AI가 갈라지는 동안 중앙에서 바로 팀원 메인이 나타납니다. 아래로 스크롤할 필요 없음.</p>
              </div>
            </div>
          </motion.div>

          {/* Hint (optional) */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center text-xs opacity-60">
            <span>Scroll</span>
          </div>
        </div>
      </section>

      {/* 필요 시: 추가 콘텐츠 섹션 (선택). 중앙 핸드오프만 원하면 삭제 가능 */}
      {/* <section className="mx-auto max-w-5xl px-6 py-28 md:py-36"> ... </section> */}
    </main>
  );
}
