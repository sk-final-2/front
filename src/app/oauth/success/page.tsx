// app/oauth/success/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setInitialAuth, setUserFromSocial } from "@/store/auth/authSlice";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const provider = searchParams.get("provider");

    if (email && name && provider) {
      dispatch(setInitialAuth("access-token-from-cookie"));

      dispatch(
        setUserFromSocial({
          email,
          name,
          loginType:
            provider === "LOCAL"
              ? "default"
              : provider.toLowerCase() as "google" | "kakao",
        })
      );
    }

    router.replace("/");
  }, [router, searchParams, dispatch]);

  return null;
}
