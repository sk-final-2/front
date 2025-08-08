import GoogleForm from "@/components/login/google/GoogleForm";
import { Suspense } from "react";

export default function GooglePage() {
  return (
    <Suspense>
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <GoogleForm />
      </div>
    </Suspense>
  );
}
