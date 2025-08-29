"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import apiClient from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BirthCalendar from "./Calender";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

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

/** 성별 데이터 */
const genderData = [
  { gender: "MALE", desc: "남자" },
  { gender: "FEMALE", desc: "여자" },
];

export default function RegisterForm() {
  const router = useRouter();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_check: "",
    gender: "MALE",
    birth: "",
    zipcode: "",
    address1: "",
    address2: "",
  });
  // 이메일 인증 코드 전송 여부
  const [emailSent, setEmailSent] = useState(false);
  // 인증 코드
  const [verificationCode, setVerificationCode] = useState("");
  // 인증 결과
  const [isVerified, setIsVerified] = useState(false);
  // 이메일 인증 코드 로딩
  const [emailLoading, setEmailLoading] = useState(false);

  // 타이머 상태
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // 성
  const [gender, setGender] = useState("MALE");
  // 생년월일
  const [birth, setBirth] = useState("");

  // 주소 상태
  const [zipcode, setZipcode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");

  // 주소 Ref
  const addressRef = useRef<HTMLInputElement>(null);

  // 제출 버튼 활성화 상태
  const [isSubmittable, setIsSubmittable] = useState(false);

  // 타이머 useEffect
  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      const timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    // 타이머가 0초가 되면 타이머와 인증 입력창을 모두 비활성화
    else if (timerSeconds <= 0) {
      // 조건을 더 명확하게 변경
      setIsTimerActive(false);
      setEmailSent(false); // 이 코드를 추가하여 인증 입력창을 숨깁니다.
      alert("인증 시간이 만료되었습니다. 인증 코드를 다시 받아주세요.");
    }
  }, [isTimerActive, timerSeconds]);

  // 항목 검사 useEffect
  useEffect(() => {
    const {
      name,
      email,
      password,
      password_check,
      gender,
      zipcode,
      address1,
      address2,
    } = formData;
    const isFormValid =
      name &&
      email &&
      password &&
      password_check &&
      password === password_check &&
      gender &&
      zipcode &&
      address1 &&
      address2;

    if (isFormValid && isVerified) {
      setIsSubmittable(true);
    } else {
      setIsSubmittable(false);
    }
  }, [formData, isVerified]);

  // 폼 데이터 onChanger
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /** 주소 핸들러 */
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data: DaumPostcodeData) {
        setZipcode(data.zonecode);
        setAddress1(data.roadAddress || data.jibunAddress);
        setFormData((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address1: data.roadAddress || data.jibunAddress,
        }));
        if (addressRef != null) {
          addressRef.current?.focus();
        }
      },
    }).open();
  }; /** 주소 핸들러 */

  // 에러 메시지 상태
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    password_check: "",
    verification: "",
    birth: "",
    address: "",
  });

  /** 폼 제출 핸들러 */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = {
      name: "",
      email: "",
      password: "",
      password_check: "",
      verification: "",
      birth: "",
      address: "",
    };

    // 필드 검증
    if (!formData.name) newErrors.name = "이름을 입력해주세요.";
    if (!formData.email) newErrors.email = "이메일을 입력해주세요.";
    // if (!isVerified) newErrors.verification = "이메일 인증을 진행해주세요.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
    if (formData.password !== formData.password_check) {
      newErrors.password_check = "비밀번호가 일치하지 않습니다.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }
    if (!formData.birth) newErrors.birth = "생년월일을 입력해주세요.";
    if (!formData.address1 || !formData.address2)
      newErrors.address = "주소 입력해주세요.";

    // 에러가 하나라도 있으면 상태 업데이트 후 종료
    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    setErrors(newErrors);

    // 서버에 전송할 데이터에서 password_check 제외
    const { password_check, ...submitData } = formData;

    console.log(formData);

    try {
      const res = await apiClient.post("/api/auth/signup", submitData);
      if (res.data.status === 200) {
        alert("회원가입이 완료되었습니다.");
        // 라우팅
        router.push("/login");
      }
    } catch (error) {
      console.error("회원가입 API 요청 실패:", error);
      // API 에러 메시지를 사용자에게 보여줄 수 있습니다.
      setErrors((prev) => ({
        ...prev,
        verification: "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
      }));
    }
  }; /** 폼 제출 핸들러 */

  /** 이메일 인증 코드 보내기 */
  const sendEmailAuthCode = async () => {
    // 이메일 인증 코드 전송 api

    // 이메일 형식 검사 정규식
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      setEmailLoading(false);
      return;
    }

    setEmailLoading(true);

    try {
      const res = await apiClient.post("/api/email/send", {
        email: formData.email,
      });
      const data = res.data;

      if (data.status === 200) {
        alert("인증 이메일이 발송되었습니다.");
        setEmailSent(true);
        setTimerSeconds(180);
        setIsTimerActive(true);
      } else {
        console.log(res);
        alert("인증 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("이메일 발송 API 요청 실패:", error);
      alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setEmailLoading(false);
    }
  }; /** 이메일 인증 코드 보내기 */

  /** 인증 코드 확인 */
  const checkEmailAuthCode = async () => {
    try {
      const res = await apiClient.post("/api/email/verify", {
        email: formData.email,
        code: verificationCode,
      });
      if (res.data.status === 200) {
        alert("인증되었습니다.");
        setIsVerified(true);
        setEmailSent(false); // 인증 UI 숨기기
        setIsTimerActive(false);
      } else {
        setErrors((prev) => ({
          ...prev,
          verification: "인증번호가 올바르지 않습니다.",
        }));
      }
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({
        ...prev,
        verification: "인증 중 오류가 발생했습니다.",
      }));
    }
  }; /** 인증 코드 확인 */

  /** 에러 초기화 함수 */
  const clearErrors = (item: string) => {
    setErrors((prev) => ({
      ...prev,
      [item]: "",
    }));
  };

  /** 성별 핸들러 */
  const changeGender = (gender: string) => {
    setGender(gender);
    setFormData((prev) => ({
      ...prev,
      gender: gender,
    }));
  };

  /** 생년월일 onChanger */
  const onChangeBirth = (birth: string) => {
    setBirth(birth);
    setFormData((prev) => ({
      ...prev,
      birth: birth,
    }));
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0 border-none shadow-xl">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">회원가입</h1>
              </div>

              <div className="flex flex-row gap-3 w-full">
                {/** 이름 */}
                <div className="grid gap-3 flex-1">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="이름 입력"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => clearErrors("name")}
                    required
                    name="name"
                  />
                </div>

                {/** 생년월일 */}
                <BirthCalendar onChangeBirth={onChangeBirth} />
              </div>

              {/** 성별 선택 */}
              <div className="grid gap-3">
                <Label htmlFor="gender">성별 선택</Label>
                <div id="gender" className="grid grid-cols-2 gap-4">
                  {genderData.map((item) => (
                    <Card
                      key={item.gender}
                      onClick={() => changeGender(item.gender)}
                      className={`h-12 flex justify-center items-center cursor-pointer ${
                        gender == item.gender ? "border-ring border-2" : ""
                      }`}
                    >
                      {item.desc}
                    </Card>
                  ))}
                </div>
              </div>

              {/** 우편번호 */}
              <div className="grid gap-3">
                <Label htmlFor="post">우편번호</Label>
                <div className="flex gap-2">
                  <Input id="post" value={zipcode} readOnly />
                  <Button
                    className="cursor-pointer"
                    onClick={handleAddressSearch}
                  >
                    주소 찾기
                  </Button>
                </div>
              </div>

              {/** 주소 */}
              <div className="grid gap-3">
                <Label htmlFor="address1">주소</Label>
                <Input id="address1" value={address1} readOnly />
              </div>

              {/** 상세 주소 */}
              <div className="grid gap-3">
                <Label htmlFor="address2">상세 주소</Label>
                <Input
                  id="address2"
                  ref={addressRef}
                  value={address2}
                  onChange={(e) => {
                    setAddress2(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      address2: e.target.value,
                    }));
                  }}
                />
              </div>

              {/** 이메일 입력 */}
              <div className="grid gap-3">
                <Label htmlFor="email">이메일</Label>
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      value={formData.email}
                      disabled={isTimerActive || isVerified}
                      onChange={handleChange}
                      onFocus={() => clearErrors("email")}
                    />
                    <Button
                      className="cursor-pointer"
                      onClick={sendEmailAuthCode}
                      disabled={emailLoading || isVerified || isTimerActive}
                    >
                      {emailLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-gray-800"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          로딩중...
                        </>
                      ) : isVerified ? (
                        "인증 완료"
                      ) : emailSent || timerSeconds < 180 ? (
                        "재전송"
                      ) : (
                        "인증 코드 발송"
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-row justify-between">
                    {errors.email && (
                      <p className="text-red-500 text-xs italic mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/** 이메일 인증 로직 */}
              {emailSent && (
                <div className="grid gap-3 w-100">
                  <div className="flex flex-row items-center gap-3">
                    {/* Input과 타이머를 감싸는 상대적 위치 컨테이너 */}
                    <div className="relative flex-grow">
                      <Input
                        id="verificationCode"
                        name="verificationCode"
                        type="text"
                        placeholder="인증번호 입력"
                        className="pr-16"
                        value={verificationCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setVerificationCode(e.target.value)
                        }
                        onFocus={() => clearErrors("verification")}
                      />
                      {/* 타이머 */}
                      {isTimerActive && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="font-semibold text-red-500">
                            {formatTime(timerSeconds)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      className="cursor-pointer"
                      onClick={checkEmailAuthCode}
                    >
                      인증하기
                    </Button>
                  </div>
                  <div className="flex flex-row justify-between">
                    {errors.verification && (
                      <p className="text-red-500 text-xs italic mt-1">
                        {errors.verification}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/** 비밀번호 입력 */}
              <div className="grid gap-3">
                <Label htmlFor="password">
                  비밀번호 (특수문자 [@, #, %, $ 등] 포함 8글자 이상)
                </Label>
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      placeholder="비밀번호"
                      onChange={handleChange}
                      onFocus={() => clearErrors("password")}
                    />
                  </div>
                  <div className="flex flex-row justify-between">
                    {errors.password && (
                      <p className="text-red-500 text-xs italic mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/** 비밀번호 확인 */}
              <div className="grid gap-3">
                <Label htmlFor="password_check">비밀번호 확인</Label>
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2 items-center">
                    <Input
                      id="password_check"
                      name="password_check"
                      type="password"
                      placeholder="비밀번호 확인"
                      value={formData.password_check}
                      onChange={handleChange}
                      onFocus={() => clearErrors("password_check")}
                    />
                  </div>
                  <div className="flex flex-row justify-between">
                    {errors.password_check && (
                      <p className="text-red-500 text-xs italic mt-1">
                        {errors.password_check}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/** 제출 버튼 */}
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={!isSubmittable}
              >
                회원가입
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
