"use client"

import React from "react";

interface ReadyStepBarProps {
  step: number;
  handleChangeStep: (step: number) => void;
}

// 각 단계에 대한 내용을 정의합니다.
const content: Record<number, string> = {
  1: "직무 선택",
  2: "문서 업로드",
  3: "카메라 & 마이크",
};

const ReadyStepBar = ({ step, handleChangeStep }: ReadyStepBarProps) => {
  const steps = Object.keys(content); // content 객체의 키(1, 2, 3)를 배열로 가져옵니다.

  return (
    <div className="w-4/6 mt-14 mb-10 flex justify-center items-center">
      {steps.map((key, index) => {
        const stepNumber = Number(key);
        // 현재 단계(isActive)인지, 이미 완료된 단계(isCompleted)인지 확인합니다.
        const isActive = stepNumber === step;
        const isCompleted = stepNumber < step;

        return (
          // React.Fragment를 사용하여 각 단계와 연결선을 그룹화합니다.
          <React.Fragment key={stepNumber}>
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleChangeStep(stepNumber)}
            >
              {/* 단계 원 */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                                    ${
                                      isActive || isCompleted
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-300 text-gray-600"
                                    }`}
              >
                <span>{stepNumber}</span>
              </div>
              {/* 단계 텍스트 */}
              <p
                className={`mt-2 text-sm font-medium transition-colors duration-300
                                ${
                                  isActive ? "text-blue-600" : "text-gray-500"
                                }`}
              >
                {content[stepNumber]}
              </p>
            </div>

            {/* 마지막 단계가 아닐 경우에만 연결선을 추가합니다. */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 transition-colors duration-300
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
