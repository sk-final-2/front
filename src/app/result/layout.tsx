import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <main className="w-screen">{children}</main>
    </SidebarProvider>
  );
}
