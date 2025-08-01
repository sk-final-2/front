import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

// `useDispatch`는 기본 훅을 그대로 사용하되, 타입을 명시하여 내보냅니다.
export const useAppDispatch = () => useDispatch<AppDispatch>();

// `useSelector`는 타입이 미리 적용된 버전을 새로 만들어 내보냅니다.
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
