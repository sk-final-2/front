import { useEffect, useRef, RefObject } from "react";

/**
 * 컴포넌트 외부 클릭을 감지하는 커스텀 훅
 * @param callback 외부 클릭 시 실행될 콜백 함수
 * @returns {RefObject<T>} 감지할 DOM 요소에 대한 ref 객체
 */
export const useOutsideClick = <T extends HTMLElement>(
  callback: () => void,
): RefObject<T> => {
  const ref = useRef<T>(null) as RefObject<T>;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ref가 존재하고, 클릭한 영역이 ref의 DOM 요소를 포함하고 있지 않다면 콜백 실행
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("mousedown", handleClickOutside);

    // 클린업 함수에서 이벤트 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);

  return ref;
};
