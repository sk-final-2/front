import React from "react";

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="w-screen">{children}</main>;
}
