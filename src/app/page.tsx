"use client";

import MainHeader from "@/components/header/Header";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import RecommendTargetSection from "@/components/home/RecommendTargetSection";
import RightSideBar from "@/components/home/RightSideBar";
import Loading from "@/components/loading/Loading";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAppDispatch } from "@/hooks/storeHook";
import { stopLoading } from "@/store/loading/loadingSlice";
import { Suspense, useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(stopLoading());
  }, [dispatch]);

  return (
    <SidebarProvider defaultOpen={false}>
      <main className=" lg:w-full w-screen h-screen overflow-y-scroll snap-y snap-mandatory">
        {/** 사이드 바 */}
        <RightSideBar />
        <MainHeader />

        <Suspense fallback={<Loading message="페이지 불러오는 중..." />}>
          {/** 히어로 섹션 */}
          <HeroSection />

          {/** 추천 대상 섹션 */}
          <RecommendTargetSection />

          {/** 기능 섹션 */}
          <FeaturesSection />
        </Suspense>
      </main>
    </SidebarProvider>
  );
}
