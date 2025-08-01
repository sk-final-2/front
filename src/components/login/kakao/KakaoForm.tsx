"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { kakaoSignup } from "@/services/auth";
import { useRouter } from "next/navigation";
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

export default function KakaoForm() {
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

    try {
      const res = await kakaoSignup(payload);
      console.log("응답 확인:", res);

      // 실제 응답 구조 기준으로 처리
      if (res.message === "소셜 로그인 성공") {
        console.log("로그인 성공 → 메인 페이지로 이동");
        router.push("/");
      } else {
        alert("회원가입이 완료되었습니다.");
        router.push("/");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[90vh] max-w-6xl mx-auto rounded-2xl shadow-lg bg-white">
      {/* 왼쪽: 이미지 영역 */}
      <div className="w-full md:w-1/2 bg-[#F6C61E] flex flex-col items-center justify-center p-10">
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

      {/* 오른쪽: 폼 영역 */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center">
        <div className="p-8 w-full max-w-md space-y-4 overflow-y-auto max-h-[90vh]">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-semibold mb-1">이름</label>
            <input
              value={userInfo.name}
              disabled
              className="w-full bg-gray-100 border px-3 py-2 rounded"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-semibold mb-1">이메일</label>
            <input
              value={userInfo.email}
              disabled
              className="w-full bg-gray-100 border px-3 py-2 rounded"
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-semibold mb-1">성별</label>
            <div className="flex gap-20">
              <label className="flex items-center gap-2 ml-4">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                />
                남성
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                />
                여성
              </label>
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-semibold mb-1">생년월일</label>
            <input
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* 우편번호 */}
          <div>
            <label className="block text-sm font-semibold mb-1">우편번호</label>
            <div className="flex gap-2">
              <input
                value={zipcode}
                readOnly
                className="flex-1 border px-3 py-2 rounded bg-gray-100"
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                className="bg-[#F6C61E] text-black text-sm font-semibold px-4 py-2 rounded hover:bg-[#e5b500]"
              >
                주소찾기
              </button>
            </div>
          </div>

          {/* 주소 */}
          <div>
            <label className="block text-sm font-semibold mb-1">주소</label>
            <input
              value={address1}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>

          {/* 상세 주소 */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              상세 주소
            </label>
            <input
              ref={addressRef}
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* 버튼 */}
          <button
            onClick={handleSubmit}
            className="w-full bg-[#F6C61E] text-black text-sm font-semibold py-2 rounded hover:bg-[#e5b500]"
          >
            회원가입 완료
          </button>
        </div>
      </div>
    </div>
  );
}
