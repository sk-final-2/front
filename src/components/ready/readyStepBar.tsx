"use client";

import React from "react";

interface ReadyStepBarProps {
  step: number;
  handleChangeStep: (step: number) => void;
}

// 각 단계에 대한 내용을 정의합니다.
const content: Record<number, string> = {
  1: "면접 형식",
  2: "직무 & 경력",
  3: "질문 & 난이도",
  4: "언어 & 카메라, 마이크",
  5: "추가 정보",
};

const ReadyStepBar = ({ step, handleChangeStep }: ReadyStepBarProps) => {
  const steps = Object.keys(content);

  return (
    <div className="w-5/6 mt-14 mb-10 flex justify-center items-center">
      {steps.map((key, index) => {
        const stepNumber = Number(key);
        const isActive = stepNumber === step;
        const isCompleted = stepNumber < step;

        return (
          <React.Fragment key={stepNumber}>
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleChangeStep(stepNumber)}
            >
              {/* 단계 원 */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-700
                                    ${
                                      isActive || isCompleted
                                        ? "bg-blue-500 text-white scale-115"
                                        : "bg-gray-300 text-gray-600"
                                    }`}
              >
                <span>{stepNumber}</span>
              </div>
              {/* 단계 텍스트 */}
              <p
                className={`mt-2 text-sm font-medium transition-colors duration-700
                                ${
                                  isActive
                                    ? "text-blue-600 scale-105"
                                    : "text-gray-500"
                                }`}
              >
                {content[stepNumber]}
              </p>
            </div>

            {/* 마지막 단계가 아닐 경우에만 연결선을 추가합니다. */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-colors duration-700
                                    ${
                                      isCompleted
                                        ? "bg-blue-500"
                                        : "bg-gray-300"
                                    }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ReadyStepBar;
