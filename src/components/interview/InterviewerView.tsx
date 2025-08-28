"use client";
import MintBotView from "./MintBotView";

type Props = {
  talking?: boolean;
  amp?: number; // 🔵 추가
};

export default function InterviewerView({ talking, amp }: Props) {
  return (
    <div className="flex-1">
      <MintBotView talking={talking} amp={amp} />
    </div>
  );
}
