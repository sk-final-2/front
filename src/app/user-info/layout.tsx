"use client";

import RightSideBar from "@/components/home/RightSideBar";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function UserInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useLoadingRouter();

  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider defaultOpen={false}>
      <main className="w-screen bg-background">
        <RightSideBar />
        <header className="p-4 flex justify-end items-center fixed w-full bg-transparent">
          <ul className="flex flex-row gap-6 mr-14 mt-4 items-center">
            <li
              className="hover:underline cursor-pointer "
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
        {children}
      </main>
    </SidebarProvider>
  );
}
