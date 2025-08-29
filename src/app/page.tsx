"use client";

import MainHeader from "@/components/header/Header";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import MainScene from "@/components/home/MainScene";
import RecommendTargetSection from "@/components/home/RecommendTargetSection";
import RightSideBar from "@/components/home/RightSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider defaultOpen={false}>
      <main className=" lg:w-full w-screen h-screen overflow-y-scroll snap-y snap-mandatory">
        {/** 사이드 바 */}
        <RightSideBar />
        <MainHeader />
        {/** 히어로 섹션 */}
        <HeroSection />

        {/** 추천 대상 섹션 */}
        <RecommendTargetSection />

        {/** 기능 섹션 */}
        <FeaturesSection />

      </main>
    </SidebarProvider>
  );
}
