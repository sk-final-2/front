"use client";

import { useState } from "react";
import { useOutsideClick } from "@/hooks/useOutsideClick"; // 커스텀 훅

interface QuestionCountDropdownProps {
  selectedCount: number;
  onCountChange: (count: number) => void;
  options?: number[];
}

const QuestionCountDropdown = ({
  selectedCount,
  onCountChange,
  options = [2, 3, 4, 5, 6], // 기본 옵션
}: QuestionCountDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // 외부 클릭 시 드롭다운을 닫는 로직
  const dropdownRef = useOutsideClick<HTMLDivElement>(() => {
    setIsOpen(false);
  });

  const handleOptionClick = (count: number) => {
    onCountChange(count); // 부모 컴포넌트로 선택된 값 전달
    setIsOpen(false); // 옵션 선택 후 드롭다운 닫기
  };

  return (
    <div
      ref={dropdownRef}
      className="relative w-48 font-sans transition duration-200 "
    >
      <label
        id="question-count-label"
        className="block mb-2 text-sm font-medium text-foreground"
      >
        질문 수 선택
      </label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-labelledby="question-count-label"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full px-4 py-2 text-left bg-background border border-border rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className="block truncate">{selectedCount}개</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {/* 화살표 아이콘 */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="question-count-label"
          className="absolute z-10 w-full mt-1 overflow-auto text-base text-foreground bg-background border-border rounded-md shadow-lg max-h-60 focus:outline-none"
        >
          {options.map((count) => (
            <li
              key={count}
              role="option"
              aria-selected={selectedCount === count}
              onClick={() => handleOptionClick(count)}
              className={`px-4 py-2 text-sm text-foreground cursor-pointer hover:bg-primary ${
                selectedCount === count
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "font-normal"
              }`}
            >
              {count} 개
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionCountDropdown;
