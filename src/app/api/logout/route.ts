import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    status: 200,
    message: "쿠키 삭제 완료 - 로그아웃 성공",
  });

  // 응답 쿠키에서 삭제 (ResponseCookies)
  response.cookies.delete("accessToken");

  return response;
}
