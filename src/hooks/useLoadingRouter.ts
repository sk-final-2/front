'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch } from './storeHook';
import { startLoading } from '@/store/loading/loadingSlice';

export function useLoadingRouter() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const push = (href: string) => {
    dispatch(startLoading()); // 페이지 이동 시작 시 로딩 상태 활성화
    router.push(href);
  };

  const replace = (href: string) => {
    dispatch(startLoading());
    router.replace(href);
  }

  return {
    ...router,
    push,
    replace,
  };
}