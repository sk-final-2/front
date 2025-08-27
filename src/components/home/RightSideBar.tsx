import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/hooks/storeHook";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp, User2 } from "lucide-react";

export default function RightSideBar() {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  const dropdownRef = useOutsideClick<HTMLDivElement>(() => {
    setOpen(false);
  });

  // 인증 상태 store
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  // 로그인하지 않은 경우
  if (!isLoggedIn) {
    return (
      <Sidebar
        variant="floating"
        side="right"
        className="z-51"
        ref={dropdownRef}
      >
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup>로그인 안함</SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="floating" side="right" className="z-51" ref={dropdownRef}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>로그인 했음</SidebarGroup>
      </SidebarContent>
      {/** Footer */}
      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 />
                  {user?.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width] z-60"
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}
