"use client";

import MainHeader from "@/components/header/Header";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import MainScene from "@/components/home/MainScene";
import RightSideBar from "@/components/home/RightSideBar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider defaultOpen={false}>
      <main className="lg:w-full w-screen h-screen overflow-y-scroll snap-y snap-mandatory">
        {/** 사이드 바 */}
        <RightSideBar />
        <MainHeader />
        {/** 히어로 섹션 div */}
        <HeroSection />
        <FeaturesSection />
        <div className="w-full h-screen snap-center">
          {/* <MainScene /> */}
        </div>
      </main>
    </SidebarProvider>
  );
}
