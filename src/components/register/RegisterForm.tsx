"use client";

import { useEffect, useRef, useState } from "react";
import TextInput from "@/components/atoms/TextInput";
import apiClient from "@/lib/axios";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_check: "",
  });
  // 이메일 인증 코드 전송 여부
  const [emailSent, setEmailSent] = useState(false);
  // 인증 코드
  const [verificationCode, setVerificationCode] = useState("");
  // 인증 결과
  const [isVerified, setIsVerified] = useState(false);
  // 이메일 인증 코드 로딩
  const [emailLoading, setEmailLoading] = useState(false);

  // 이메일 주소 입력 Ref
  const emailRef = useRef<HTMLInputElement>(null);

  // 타이머 상태
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // 타이머 useEffect
  useEffect(() => {
    // isTimerActive가 true이고, timerSeconds가 0보다 클 때만 인터벌 실행
    if (isTimerActive && timerSeconds > 0) {
      const timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);

      // 컴포넌트 언마운트 또는 timerSeconds가 0이 되면 인터벌 정리
      return () => clearInterval(timer);
    }
    // 타이머가 0초가 되면 타이머 비활성화
    else if (timerSeconds === 0) {
      setTimerSeconds(180);
      setIsTimerActive(false);
      setEmailSent(false);
      setIsVerified(false);
      if (emailRef.current) {
        emailRef.current.disabled = false;
      }
      alert("인증 시간이 만료되었습니다. 인증 코드를 다시 받아주세요.");
    }
  }, [isTimerActive, timerSeconds]);

  // 폼 데이터 onChanger
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 에러 메시지 상태
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    password_check: "",
    verification: "",
  });

  // 폼 제출 핸들러 수정
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = { ...errors };

    // 필드 검증
    if (!formData.name) newErrors.name = "이름을 입력해주세요.";
    if (!formData.email) newErrors.email = "이메일을 입력해주세요.";
    if (!isVerified) newErrors.verification = "이메일 인증을 진행해주세요.";
    if (!formData.password) newErrors.password = "비밀번호를 입력해주세요.";
    if (formData.password !== formData.password_check) {
      newErrors.password_check = "비밀번호가 일치하지 않습니다.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    // 에러가 하나라도 있으면 상태 업데이트 후 종료
    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    // 서버에 전송할 데이터에서 password_check 제외
    const { password_check, ...submitData } = formData;

    try {
      const res = await apiClient.post("/api/auth/signup", submitData);
      if (res.status === 200) {
        alert("회원가입이 완료되었습니다.");
        // window.location.href 대신 Next.js의 useRouter 사용을 권장합니다.
        window.location.href = "/";
      }
    } catch (error) {
      console.error("회원가입 API 요청 실패:", error);
      // API 에러 메시지를 사용자에게 보여줄 수 있습니다.
      setErrors((prev) => ({
        ...prev,
        verification: "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
      }));
    }
  };

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
        // 이메일 입력 비활성화
        if (emailRef.current) {
          emailRef.current.disabled = true;
        }
        setTimerSeconds(180);
        setIsTimerActive(true);
      } else {
        console.log(res);
        if (emailRef.current) {
          emailRef.current.disabled = false;
        }
        alert("인증 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("이메일 발송 API 요청 실패:", error);
      if (emailRef.current) {
        emailRef.current.disabled = false;
      }
      alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setEmailLoading(false);
    }
  };

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
  };

  /** 에러 초기화 함수 */
  const clearErrors = (item: string) => {
    setErrors((prev) => ({
      ...prev,
      [item]: "",
    }));
  };

  return (
    <div className="border-t-2 border-gray-600 min-w-[35rem] h-auto mt-10">
      <form onSubmit={handleSubmit}>
        {/** 이름 입력 */}
        <TextInput
          label="이름"
          id="name"
          name="name"
          type="text"
          error={errors.name}
          value={formData.name}
          placeholder="이름 입력"
          onChange={handleChange}
          onFocus={() => clearErrors("name")}
        />

        {/** 성별 선택 */}

        {/** 생년월일 */}

        {/** 이메일 입력 */}
        <div className="flex flex-row">
          <TextInput
            label="이메일"
            id="email"
            name="email"
            type="email"
            error={errors.email}
            value={formData.email}
            placeholder="example@example.com"
            ref={emailRef}
            onChange={handleChange}
            onFocus={() => clearErrors("email")}
            button={
              <button
                type="button"
                className="text-sm bg-gray-200 border-gray-600 hover:bg-gray-700 hover:text-white rounded-md border-[1px] px-4 flex-shrink-0 cursor-pointer flex items-center justify-center
                  disabled:opacity-60 disabled:border-gray-200"
                onClick={sendEmailAuthCode}
                disabled={emailLoading || isVerified}
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
              </button>
            }
          />
        </div>

        {/** 이메일 인증 로직 */}
        {emailSent && (
          <>
            <div className="flex flex-row items-end">
              <TextInput
                label="인증번호"
                id="verificationCode"
                name="verificationCode"
                type="text"
                error={errors.verification}
                placeholder="인증번호 입력"
                value={verificationCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVerificationCode(e.target.value)
                }
                onFocus={() => clearErrors("verification")}
                button={
                  <button
                    type="button"
                    className="bg-blue-500 cursor-pointer text-white text-sm py-2 px-4 rounded-md mt-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={checkEmailAuthCode}
                  >
                    인증하기
                  </button>
                }
              />
            </div>
            <div className="w-full flex justify-end">
              {/** 타이머 */}
              {isTimerActive && (
                <span className="mr-4 pb-3 font-semibold text-red-500">
                  {formatTime(timerSeconds)}
                </span>
              )}
            </div>
          </>
        )}

        {/** 비밀번호 입력 */}
        <TextInput
          label="비밀번호"
          id="password"
          name="password"
          type="password"
          error={errors.password}
          value={formData.password}
          placeholder="비밀번호"
          onChange={handleChange}
          onFocus={() => clearErrors("password")}
        />

        {/** 비밀번호 확인 */}
        <TextInput
          label="비밀번호 확인"
          id="password_check"
          name="password_check"
          type="password"
          error={errors.password_check}
          value={formData.password_check}
          placeholder="비밀번호 확인"
          onChange={handleChange}
          onFocus={() => clearErrors("password_check")}
        />

        {/** 제출 버튼 */}
        <button
          type="submit"
          disabled
          className=" w-full mt-8 h-10 rounded-xl border-2 border-gray-900 bg-gray-400 text-white font-bold hover:bg-gray-700 cursor-pointer disabled:opacity-50"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
