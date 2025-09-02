interface QuestionDisplayProps {
  seq: number;
  question: string;
}

export default function QuestionDisplay({ seq, question }: QuestionDisplayProps) {
  return (
    <section
      className="relative rounded-xl border border-border bg-card shadow-sm p-4 md:p-5"
      aria-label={`질문 ${seq}`}
    >
      {/* 본문 행: 원형 번호 + 텍스트 */}
      <div
        className="grid items-center gap-x-4 md:gap-x-5" // 가로 간격만!
        style={{ gridTemplateColumns: "auto minmax(0,1fr)" }} // 2열 강제
      >
        {/* 왼쪽: 번호 원형 */}
        <div className="shrink-0 flex items-center justify-center size-12 md:size-14 rounded-full
                        bg-primary/10 border-2 border-primary text-primary font-bold text-lg md:text-xl select-none">
          {seq}
        </div>

        {/* 오른쪽: 텍스트 + (오른쪽 칸 전체 기준) 밑줄 */}
        <div
          className="relative min-w-0 pb-3
                     after:content-[''] after:absolute after:bottom-0 after:right-0
                     after:h-[2px] after:rounded-md after:bg-primary/60
                     after:left-0"
        >
          <p className="text-foreground text-[15px] md:text-[17px] leading-[1.6] tracking-[-0.005em]
                        whitespace-pre-wrap break-words">
            {question || "질문을 불러오는 중…"}
          </p>
        </div>
      </div>
    </section>
  );
}
