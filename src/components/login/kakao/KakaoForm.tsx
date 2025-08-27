"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { useRouter } from "next/navigation";
import { kakaoSignup } from "@/store/auth/authSlice";
import { useSearchParams } from "next/navigation";
import React from "react";
import Image from "next/image";

interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (options: DaumPostcodeOptions) => {
        open: () => void;
      };
    };
  }
}

export default function KakaoForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });

  const [gender, setGender] = useState("male");
  const [birth, setBirth] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  const addressRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const authState = useAppSelector((state) => state.auth.state);
  const error = useAppSelector((state) => state.auth.error);

  const prevStateRef = useRef(authState);

  useEffect(() => {
    const name = searchParams.get("name") ?? "";
    const email = searchParams.get("email") ?? "";

    setUserInfo({ name, email });
  }, [searchParams]);

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data: DaumPostcodeData) {
        setZipcode(data.zonecode);
        setAddress1(data.roadAddress || data.jibunAddress);
        addressRef.current?.focus();
      },
    }).open();
  };

  const handleSubmit = async () => {
    const payload = {
      name: userInfo.name,
      email: userInfo.email,
      gender: gender.toUpperCase() as "MALE" | "FEMALE",
      birth,
      zipcode,
      address1,
      address2,
    };

    dispatch(kakaoSignup(payload));
  };

  useEffect(() => {
    if (prevStateRef.current === "loading" && authState === "successed") {
      router.push("/");
    }

    if (prevStateRef.current === "loading" && authState === "failed") {
      alert(error || "회원가입 중 오류가 발생했습니다.");
    }

    prevStateRef.current = authState;
  }, [authState, error, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">카카오 회원가입</h1>
                <p className="text-muted-foreground text-balance">
                  Sign up with KAKAO
                </p>
              </div>
              <div className="grid gap-3">
                <Label>이름</Label>
                <Input value={userInfo.name} disabled />
              </div>
              <div className="grid gap-3">
                <Label>이메일</Label>
                <Input value={userInfo.email} disabled />
              </div>
              <div className="grid gap-3">
                <Label>성별</Label>
                <RadioGroup className="flex items-center gap-12" defaultValue="comfortable">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="default" id="r1" />
                    <Label htmlFor="r1">남성</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="comfortable" id="r2" />
                    <Label htmlFor="r2">여성</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-[#F6C61E] text-black text-sm py-2 rounded hover:bg-[#e5b500]"
              >
                회원가입 완료
              </Button>
            </div>
          </form>
          <div className="w-full bg-[#F6C61E] flex flex-col items-center justify-center p-10">
            <Image
              src="/images/kakao.jpg" // public/images 폴더에 저장
              alt="Kakao 캐릭터"
              width={400}
              height={400}
              className="mb-6"
            />
            <div className="text-black text-center">
              <h1 className="text-4xl font-extrabold mb-8">Kakao</h1>
              <p className="text-sm font-semibold text-center">
                카카오 소셜 로그인이 처음이라면 <br />
                간단한 회원가입이 필요합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
