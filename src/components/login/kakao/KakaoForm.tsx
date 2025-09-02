"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHook";
import { kakaoSignup } from "@/store/auth/authSlice";
import { useSearchParams } from "next/navigation";
import React from "react";
import Image from "next/image";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import { stopLoading } from "@/store/loading/loadingSlice";

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
  const router = useLoadingRouter();

  // 페이지 이동 완료 시 로딩 종료
  useEffect(() => {
    dispatch(stopLoading());
  }, [dispatch]);

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

  // Redux 상태
  const authState = useAppSelector((state) => state.auth.state);
  const error = useAppSelector((state) => state.auth.error);

  const prevStateRef = useRef(authState);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const name = searchParams.get("name") ?? "";
    const email = searchParams.get("email") ?? "";

    setUserInfo({ name, email });
  }, [searchParams]);

  const handleAddressSearch = () => {
    // 현재 환경이 브라우저인지, 그리고 daum 객체가 로드되었는지 확인합니다.
    if (typeof window !== "undefined" && window.daum) {
      new window.daum.Postcode({
        oncomplete: function (data: DaumPostcodeData) {
          setZipcode(data.zonecode);
          setAddress1(data.roadAddress || data.jibunAddress);
          addressRef.current?.focus(); // 상세 주소 필드로 포커스 이동
        },
      }).open();
    } else {
      // 스크립트가 로드되지 않았거나 서버 환경일 경우의 예외 처리
      console.error("Daum Postcode script is not loaded.");
      alert("주소 찾기 서비스를 일시적으로 사용할 수 없습니다.");
    }
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
      setOpen(true);
    }

    if (prevStateRef.current === "loading" && authState === "failed") {
      alert(error || "회원가입 중 오류가 발생했습니다.");
    }

    prevStateRef.current = authState;
  }, [authState, error, router]);

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">카카오 회원가입</h1>
                <p className="text-muted-foreground text-balance">
                  Sign up with KAKAO
                </p>
              </div>

              {/* 이름 */}
              <div className="grid gap-2">
                <Label>이름</Label>
                <Input value={userInfo.name} disabled />
              </div>

              {/* 이메일 */}
              <div className="grid gap-2">
                <Label>이메일</Label>
                <Input value={userInfo.email} disabled />
              </div>

              {/* 성별 */}
              <div className="grid gap-3">
                <Label>성별</Label>
                <RadioGroup
                  className="flex items-center gap-12 ml-2"
                  defaultValue="male"
                  value={gender}
                  onValueChange={setGender}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="male" id="r1" />
                    <Label htmlFor="r1">남성</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="female" id="r2" />
                    <Label htmlFor="r2">여성</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 생년월일 */}
              <div className="grid gap-2">
                <Label>생년월일</Label>
                <div className="relative">
                  <Input
                    id="birth"
                    type="date"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                    className={[
                      "pr-10",
                      // 기본 아이콘 숨김 (크롬)
                      "[&::-webkit-calendar-picker-indicator]:opacity-0",
                      "[&::-webkit-inner-spin-button]:hidden",
                      "[&::-webkit-clear-button]:hidden",
                    ].join(" ")}
                  />
                  {/* 아이콘 클릭 시 달력 열기 */}
                  <button
                    type="button"
                    aria-label="달력 열기"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      const el = document.getElementById(
                        "birth",
                      ) as HTMLInputElement | null;
                      if (!el) return;
                      if (typeof el.showPicker === "function") el.showPicker();
                      else {
                        // 폴백: 포커스 후 클릭 (사파리/파폭 등)
                        el.focus();
                        el.click();
                      }
                    }}
                    onMouseDown={(e) => e.preventDefault()} // 포커스 깜빡임 방지
                  >
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* 우편번호 */}
              <div className="grid gap-2">
                <Label>우편번호</Label>
                <div className="flex gap-2">
                  <Input value={zipcode} readOnly />
                  <Button
                    type="button"
                    onClick={handleAddressSearch}
                    className="bg-[#F6C61E] text-black text-sm px-4 py-2 rounded hover:bg-[#e5b500]"
                  >
                    주소찾기
                  </Button>
                </div>
              </div>

              {/* 주소 */}
              <div className="grid gap-2">
                <Label>주소</Label>
                <Input value={address1} readOnly />
              </div>

              {/* 상세 주소 */}
              <div className="grid gap-2">
                <Label>상세 주소</Label>
                <Input
                  ref={addressRef}
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                />
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-[#F6C61E] text-black text-sm py-2 rounded hover:bg-[#e5b500]"
              >
                회원가입하기
              </Button>

              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>로그인 안내</AlertDialogTitle>
                    <AlertDialogDescription>
                      회원가입이 완료되었습니다. 계속 이용하시려면 로그인을
                      해주세요.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction
                      onClick={() => {
                        router.push("/");
                      }}
                    >
                      OK
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="relative hidden md:flex w-full h-full bg-[#F6C61E] flex flex-col items-center justify-center p-10">
            <Image
              src="/images/kakao.png" // public/images 폴더에 저장
              alt="Kakao 캐릭터"
              width={400}
              height={400}
              className="mb-6"
            />
            <div className="text-black text-center">
              <h1 className="text-4xl font-extrabold mb-8">Kakao</h1>
              <p className="text-[#000000] text-balance">
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
