"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logout, logoutUser } from "@/store/auth/authSlice";
import { useAppDispatch } from "@/hooks/storeHook";

export default function MainHeader() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNav = (path: string) => {
    if (!isLoggedIn) {
      router.push("/login"); // 로그인 안 했으면 무조건 로그인 페이지로
    } else {
      router.push(path);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return (
    <header className="p-4 bg-gray-100 flex justify-between items-center relative">
      <h1
        className="font-bold text-lg cursor-pointer"
        onClick={() => router.push("/")}
      >
        메인 페이지
      </h1>

      <nav className="flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            {/* 내정보 버튼 */}
            <button
              className="hover:underline relative"
              onClick={() => setIsModalOpen((prev) => !prev)}
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
                  className="mt-4 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            )}

            {/* 면접준비페이지 버튼 */}
            <button
              className="hover:underline"
              onClick={() => handleNav("/ready")}
            >
              면접준비페이지
            </button>
          </>
        ) : (
          <>
            <button
              className="hover:underline"
              onClick={() => router.push("/login")}
            >
              로그인/회원가입
            </button>
            <button
              className="hover:underline"
              onClick={() => handleNav("/login")}
            >
              면접준비페이지
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
