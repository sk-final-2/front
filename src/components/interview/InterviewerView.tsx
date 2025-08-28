"use client";
import MintBotView from "./MintBotView";

type Props = {
  talking?: boolean;
  amp?: number; // 🔵 추가
};

export default function InterviewerView({ talking, amp }: Props) {
  return (
    <div className="relative w-full bg-muted rounded-xl overflow-hidden aspect-[16/9] md:aspect-[16/9]">
      <div className="absolute inset-0">
        <MintBotView talking={talking} amp={amp} />
      </div>
    </div>
  );
}
