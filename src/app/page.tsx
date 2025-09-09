"use client";

import MainHeader from "@/components/header/Header";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import RecommendTargetSection from "@/components/home/RecommendTargetSection";
import RightSideBar from "@/components/home/RightSideBar";
import Loading from "@/components/loading/Loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { stopLoading } from "@/store/loading/loadingSlice";
import { Suspense, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useLoadingRouter();
  const { isLoading } = useAppSelector((state) => state.loading);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleAuthRequired = () => {
    setIsAlertOpen(true); // AlertDialog를 열기
  };

  useEffect(() => {
    dispatch(stopLoading());
  }, [dispatch, isLoading]);

  return (
    <SidebarProvider defaultOpen={false}>
      <main className=" lg:w-full w-screen h-screen overflow-y-scroll snap-y snap-mandatory">
        {/** 사이드 바 */}
        <RightSideBar onAuthRequired={handleAuthRequired} />

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent className="border-none bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle>로그인이 필요합니다.</AlertDialogTitle>
              <AlertDialogDescription>
                로그인 페이지로 이동하시겠습니까?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push("/login")}
                className="cursor-pointer"
              >
                확인
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <MainHeader />

        <Suspense fallback={<Loading message="페이지 불러오는 중..." />}>
          {/** 히어로 섹션 */}
          <HeroSection />

          {/** 추천 대상 섹션 */}
          <RecommendTargetSection />

          {/** 기능 섹션 */}
          <FeaturesSection />

          {/** 가이드라인 섹션 */}
        </Suspense>
      </main>
    </SidebarProvider>
  );
}
