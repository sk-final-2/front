"use client"

import AnimationLayout from "@/components/animation/AnimationLayout";
import MainHeader from "@/components/header/Header";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import MainScene from "@/components/home/MainScene";

export default function Home() {
  return (
    <main className="lg:w-full h-screen overflow-y-scroll snap-y snap-mandatory">
      <MainHeader />
      {/** 히어로 섹션 div */}
      <HeroSection />
        <FeaturesSection />
      <div className="w-full h-screen snap-center">
        <MainScene />
      </div>
    </main>
  );
}
