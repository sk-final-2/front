import KakaoForm from "@/components/login/kakao/KakaoForm";
import { Suspense } from "react";

export default function KakaoPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <Suspense>
        <KakaoForm />
      </Suspense>
    </div>
  );
}
