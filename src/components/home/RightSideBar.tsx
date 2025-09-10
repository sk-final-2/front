import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { House, LogOut, MessagesSquare, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/store/auth/authSlice";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import { useRouter } from "next/navigation";

const navigationMenu = [
  {
    name: "메인 페이지",
    href: "/",
    icon: <House className="w-6 mt-2 ml-2" />,
    authRequired: false,
  },
  {
    name: "면접 시작",
    href: "/ready",
    icon: <MessagesSquare className="w-6 mt-2 ml-2" />,
    authRequired: true,
  },
  {
    name: "내 정보",
    href: "/info",
    icon: <User2 className="w-6 mt-2 ml-2" />,
    authRequired: true,
  },
];

interface RightSideBarProps {
  onAuthRequired: () => void;
}

export default function RightSideBar({ onAuthRequired }: RightSideBarProps) {
  const { setOpen } = useSidebar();

  const sideBarRef = useOutsideClick<HTMLDivElement>(() => {
    setOpen(false);
  });

  const dispatch = useAppDispatch();
  const loadingRouter = useLoadingRouter();

  // 인증 상태 store
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <Sidebar
        variant="floating"
        side="right"
        className="z-51"
        ref={sideBarRef}
      >
        <SidebarHeader className="h-32 flex items-center justify-center">
          <div className="flex flex-col gap-2 justify-center items-center">
            <span className="text-center">로그인이 필요합니다.</span>
            <Button
              className="cursor-pointer w-24"
              onClick={() => {
                loadingRouter.push("/login");
                setOpen(false);
              }}
            >
              로그인
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col items-center">
          <SidebarGroup className="flex flex-col mt-4 gap-4 justify-center">
            {/** 여기에 네비게이션 메뉴 */}
            {navigationMenu.map((menu) => (
              <div
                key={menu.name}
                className="w-full flex gap-4 cursor-pointer hover:bg-border rounded-3xl"
                onClick={() => {
                  if (menu.authRequired) {
                    onAuthRequired(); // 부모 컴포넌트에 알림
                  } else {
                    loadingRouter.push(menu.href); // 인증이 필요없는 메뉴는 바로 이동
                  }
                  setOpen(false); // 어떤 메뉴를 클릭하든 사이드바는 닫기
                }}
              >
                {menu.icon}
                <span className="w-full p-2">{menu.name}</span>
              </div>
            ))}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      console.log("백 로그아웃");

      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      console.log("프론트 로그아웃");

      setOpen(false);
      loadingRouter.refresh();
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return (
    <Sidebar variant="floating" side="right" className="z-51" ref={sideBarRef}>
      <SidebarHeader className="h-32 flex items-center justify-center">
        {/** 유저 정보 */}
        <div className="flex flex-col gap-2 justify-center items-center">
          <span className="text-center">환영합니다, {user?.name}님!</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex flex-col mt-4 gap-4 justify-center">
          {/** 여기에 네비게이션 메뉴 */}
          {navigationMenu.map((menu) => (
            <div
              key={menu.name}
              className="w-full flex gap-4 cursor-pointer hover:bg-border rounded-3xl"
              onClick={() => {
                loadingRouter.push(menu.href);

                setOpen(false);
              }}
            >
              {menu.icon}
              <span className="w-full p-2">{menu.name}</span>
            </div>
          ))}
        </SidebarGroup>
      </SidebarContent>
      {/** Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarContent
            className="cursor-pointer flex flex-row items-center gap-4 hover:bg-muted rounded-3xl"
            onClick={handleLogout}
          >
            <LogOut className="w-6 my-2 ml-4" />
            <span className="my-2 ml-2 text-destructive">Log out</span>
          </SidebarContent>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
