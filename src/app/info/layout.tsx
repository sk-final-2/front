"use client";

export default function UserInfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="w-screen bg-background">{children}</main>;
}
