"use client";

import { useState, useRef } from "react";
import { login } from "@/services/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleKakaoLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setLoginError("");

    if (!email.trim()) {
      setEmailError("이메일을 입력해주세요.");
      emailRef.current?.focus();
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      emailRef.current?.focus();
      return;
    }

    if (!password.trim()) {
      setPasswordError("비밀번호를 입력해주세요.");
      passwordRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      console.log("로그인 성공:", res.data);
      //localStorage.setItem('token', res.data.token);
      router.push("/");
    } catch (error: unknown) {
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
      console.error("로그인 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-80 relative z-10 transform transition duration-500 ease-in-out">
        <h2 className="text-center text-3xl font-bold mb-8 text-gray-800">
          로그인
        </h2>
        {loginError && (
          <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              ref={emailRef}
              className="w-full h-12 border border-gray-800 px-3 rounded-lg"
              placeholder="이메일"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>
          <div>
            <input
              ref={passwordRef}
              className="w-full h-12 border border-gray-800 px-3 rounded-lg"
              placeholder="비밀번호"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full h-12 bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            카카오 로그인
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white hover:bg-gray-100 text-black font-bold py-2 px-4 rounded flex items-center justify-center gap-2 border border-gray-300"
          >
            구글 로그인
          </button>
          <p className="text-center text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-medium hover:underline hover:text-blue-800"
            >
              회원가입하기
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
