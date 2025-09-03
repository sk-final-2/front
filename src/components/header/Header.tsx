"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useState } from "react";
import { logoutUser } from "@/store/auth/authSlice";
import { useAppDispatch } from "@/hooks/storeHook";
import Image from "next/image";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";

export default function MainHeader() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useLoadingRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      console.log("백 로그아웃");

      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      console.log("프론트 로그아웃");

      router.refresh();
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return (
    <header className="p-4 flex justify-between items-center fixed left-0 right-0 z-9 bg-background shadow-lg">
      <Image
        src="/REAI.png"
        alt="icon"
        width={60}
        height={20}
        onClick={() => router.replace("/")}
        className="cursor-pointer bg-transparent"
      ></Image>

      <nav className="flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            {/* 내정보 버튼 */}
            <button
              className="hover:underline relative cursor-pointer"
              onClick={() => router.push("/info")}
            >
              내정보
            </button>

            {/* 모달 */}
            {isModalOpen && (
              <div className="absolute top-14 right-4 bg-white border rounded shadow-md p-4 w-56">
                <p className="font-semibold mb-2">사용자 정보</p>
                <p className="text-sm text-gray-600">이름: {user?.name}</p>
                <p className="text-sm text-gray-600">이메일: {user?.email}</p>

                <button
                  className="mt-4 w-full cursor-pointer bg-red-500 text-white py-1 rounded hover:bg-red-600"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Button
              className="cursor-pointer bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0px_4px_32px_0_rgba(99,102,241,.70)] px-6 py-3 rounded-xl border-[1px] border-slate-500 text-white font-medium group"
              onClick={() => router.push("/login")}
            >
              <div className="relative overflow-hidden">
                <p className="group-hover:-translate-y-7 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                  로그인 & 회원가입
                </p>
                <p className="absolute top-7 left-0 group-hover:top-0 duration-[1.125s] ease-[cubic-bezier(0.19,1,0.22,1)]">
                  로그인 & 회원가입
                </p>
              </div>
            </Button>
          </>
        )}

        {/** Theme 버튼 'light', 'dark' */}
        <Button
          className="cursor-pointer"
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme == "light" ? "dark" : "light")}
        >
          {theme != "dark" ? (
            <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-0 transition-all dark:-rotate-90" />
          ) : (
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0" />
          )}
        </Button>

        <SidebarTrigger />
      </nav>
    </header>
  );
}
