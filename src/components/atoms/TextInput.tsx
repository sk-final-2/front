"use client";

import React, {
  InputHTMLAttributes,
  ReactNode,
  forwardRef, // forwardRef를 import 합니다.
} from "react";

// 컴포넌트의 props 타입을 정의합니다.
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  button?: ReactNode;
  error?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, id, button, error, ...props }, ref) => {
    // 이메일 인증 버튼 있는 경우

    return (
      <div className="mb-4 flex flex-row justify-between mt-6 items-center w-full h-auto gap-4">
        <label
          htmlFor={id}
          className="block text-gray-700 text-sm font-bold w-28 flex-shrink-0"
        >
          {label}
        </label>
        <div className="flex flex-col flex-1 w-full">
          <div className="flex flex-row gap-2 items-center">
            <input
              id={id}
              ref={ref}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-sm text-gray-700 leading-tight focus:outline-gray-800 focus:shadow-outline flex-1"
              {...props}
            />
            {button}
          </div>
          <div className="flex flex-row justify-between">
            {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
          </div>
        </div>
      </div>
    );
  },
);

TextInput.displayName = "TextInput";

export default TextInput;
