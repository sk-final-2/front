"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/storeHook";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import AuthAlertDialog from "../auth/AuthAlertDialog";
import UserDetailInfo from "@/components/user-details/UserDetailInfo";
import UserInterviewResults from "@/components/user-details/UserInterviewResults";
import Image from "next/image";
import { CircleUser, House, MessageSquareText } from "lucide-react";

export type CategoryType = "info" | "interviews";

const UserInfoPage = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const router = useLoadingRouter();

  const [showLoginAlert, setShowLoginAlert] = useState<boolean>(false);

  const [currentCategory, setCurrentCategory] = useState<CategoryType>("info");

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
    <div
      className={`
        flex flex-row
        min-w-[768px]
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
  );
};

// <a href="https://www.flaticon.com/kr/free-icons/" title="이메일 아이콘">이메일 아이콘 제작자: Freepik - Flaticon</a>

export default UserInfoPage;
