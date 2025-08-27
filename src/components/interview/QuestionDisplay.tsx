// components/interview/QuestionDisplay.tsx
interface QuestionDisplayProps {
  seq: number;
  question: string;
}

export default function QuestionDisplay({
  seq,
  question,
}: QuestionDisplayProps) {
  return (
    <section
      className={[
        "relative rounded-xl border border-border bg-card shadow-sm",
        "p-5 md:p-6",
        "overflow-hidden", // 밑줄 라인 잘림 방지
      ].join(" ")}
      aria-label={`질문 ${seq}`}
    >
      {/* 본문 행: 원형 번호 + 텍스트 */}
      <div className="flex items-center gap-4 md:gap-5">
        {/* 번호 원형 */}
        <div
          className={[
            "flex items-center justify-center",
            "size-14 md:size-16 rounded-full",
            "bg-primary/10 border-2 border-primary text-primary",
            "font-bold text-lg md:text-xl",
            // 파란 느낌의 부드러운 그림자
            "shadow-sm",
            "select-none",
          ].join(" ")}
        >
          {seq}
        </div>

        {/* 질문 텍스트 */}
        <p
          className={[
            "flex-1",
            "text-foreground text-base md:text-lg",
            "leading-relaxed tracking-[-0.005em]",
            "whitespace-pre-wrap break-words",
          ].join(" ")}
        >
          {question || "질문을 불러오는 중…"}
        </p>
      </div>

      {/* 하단 블루 라인 (살짝 그림자) */}
      <div
        className="pointer-events-none absolute right-3 h-[2px] rounded-md bg-primary/60"
        // 원형의 중심쯤에서 시작하도록 좌측 오프셋 고정
        style={{ left: "5.5rem", bottom: "1.25rem" }}
        aria-hidden="true"
      />
    </section>
  );
}
