import { LevelType } from "@/app/ready/page";
import React from "react";

type DifficultyLevelComponentProps = {
  difficulty: LevelType;
  handleDifficultyLevel: (difficulty: LevelType) => void;
};

const Levels: LevelType[] = ["상", "중", "하"];

const LevelColorMap: Record<LevelType, string> = {
  상: "bg-[#dc3545] text-[#FFFFFF]",
  중: "bg-[#ffc107] text-[#FFFFFF]",
  하: "bg-[#28a745] text-[#FFFFFF]",
};

const NoticeTextMap: Record<LevelType, string> = {
  상: "전문가 수준의 최고 난이도, 강력한 도전을 즐기는 분들을 위한 단계",
  중: `가장 많이 선택되는 일반 난이도, 적당한 난이도를 선호하는 분께 추천`,
  하: "입문자를 위한 기본 난이도, 부담 없이 시작하기 좋은 단계",
};

const DifficultyLevelComponent = ({
  difficulty,
  handleDifficultyLevel,
}: DifficultyLevelComponentProps) => {
  return (
    // 컴포넌트 컨테이너
    <div className="w-full">
      <div className="w-full flex flex-row gap-4 mt-10">
        {Levels.map((level) => (
          <div
            key={level}
            className={`flex-1 flex justify-center items-center text-lg font-bold h-20 border-2 border-solid rounded-lg transition duration-300 hover:scale-105  ${
              level === difficulty
                ? LevelColorMap[level]
                : "bg-[#FFFFFF] text-[#6c757d]"
            }`}
            onClick={() => handleDifficultyLevel(level)}
          >
            {level}
          </div>
        ))}
      </div>
      {/** 안내 문구 */}
      <div className="mt-5 text-center text-md font-bold">{NoticeTextMap[difficulty]}</div>
    </div>
  );
};

export default DifficultyLevelComponent;
