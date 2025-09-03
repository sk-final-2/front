"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import AuthAlertDialog from "@/app/auth/AuthAlertDialog";
import UserDetailInfo from "@/components/user-details/UserDetailInfo";
import UserInterviewResults from "@/components/user-details/UserInterviewResults";
import Image from "next/image";
import { CircleUser, House, MessageSquareText } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { stopLoading } from "@/store/loading/loadingSlice";

export type CategoryType = "info" | "interviews";

const UserInfoPage = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const router = useLoadingRouter();
  const dispatch = useAppDispatch();

  const { theme, setTheme } = useTheme();

  const [showLoginAlert, setShowLoginAlert] = useState<boolean>(false);

  const [currentCategory, setCurrentCategory] = useState<CategoryType>("info");

  useEffect(() => {
    dispatch(stopLoading());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
    }
  }, [router, isLoggedIn]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024);
    };

    checkScreenWidth();

    window.addEventListener("resize", checkScreenWidth);

    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  const sidebarWidth = isSidebarCollapsed ? "w-20" : "w-64";

  const handleCurrentCategory = (category: CategoryType) => {
    setCurrentCategory(category);
  };

  // 카테고리별 컴포넌트 렌더링
  const renderCategoryComponents = () => {
    switch (currentCategory) {
      case "info":
        return <UserDetailInfo handleCurrentCategory={handleCurrentCategory} />;

      case "interviews":
        return <UserInterviewResults />;

      default:
        return null;
    }
  };

  return (
    <div>
      <header className="p-4 flex justify-end items-center fixed w-full bg-transparent">
        <ul className="flex flex-row gap-6 mr-14 mt-4 items-center">
          <li
            className="hover:underline cursor-pointer"
            onClick={() => router.push("/")}
          >
            홈으로
          </li>
          <li className="items-center">
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
          </li>
        </ul>
      </header>
      <div
        className={`
        flex flex-row
        bg-background
        min-w-[1024px]
        min-h-screen
      `}
      >
        {/** 로그인 필요 경고창 */}
        <AuthAlertDialog
          showLoginAlert={showLoginAlert}
          setShowLoginAlert={setShowLoginAlert}
        />

        {/** 커스텀 사이드 바 */}
        <div
          className={`
                fixed
                bg-background h-screen
                ${sidebarWidth}
                md:block
                transition-all duration-300 ease-in-out
                border-[1px] border-border z-10
            `}
        >
          <div className={`p-5 flex justify-center`}>
            {isSidebarCollapsed ? (
              <House className="h-[2.5rem] w-[2.5rem] p-2 rounded-2xl cursor-pointer hover:bg-muted"></House>
            ) : (
              <Image
                src="/REAI.png"
                alt="icon"
                width={60}
                height={20}
                onClick={() => router.push("/")}
                className="cursor-pointer bg-transparent"
              ></Image>
            )}
          </div>
          {/** 네비게이션 메뉴 : 내 정보 */}
          <div
            className={`h-14 font-semibold mt-20 text-center flex justify-center items-center cursor-pointer rounded-xl mx-2 transition-all duration-200
          ${
            currentCategory == "info"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
            onClick={() => setCurrentCategory("info")}
          >
            {isSidebarCollapsed ? <CircleUser /> : <span>내 정보</span>}
          </div>

          {/** 네비게이션 메뉴 : 완료한 면접 리스트 */}
          <div
            className={`h-14 font-semibold mt-5 text-center flex justify-center items-center cursor-pointer rounded-xl mx-2 transition-all duration-200
            ${
              currentCategory == "interviews"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            onClick={() => setCurrentCategory("interviews")}
          >
            {isSidebarCollapsed ? (
              <MessageSquareText />
            ) : (
              <span>완료한 면접</span>
            )}
          </div>
        </div>

        <div
          className={`h-screen w-5xl transition-all duration-200 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          {renderCategoryComponents()}
        </div>
      </div>
    </div>
  );
};

// <a href="https://www.flaticon.com/kr/free-icons/" title="이메일 아이콘">이메일 아이콘 제작자: Freepik - Flaticon</a>

export default UserInfoPage;
