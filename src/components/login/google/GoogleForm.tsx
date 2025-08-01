"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { googleSignup } from "@/services/auth";
import { useRouter } from "next/navigation";

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

export default function GoogleForm() {
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
      const res = await googleSignup(payload);
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
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto space-y-4">
      {/* 수정 불가능한 기본 정보 */}
      <div>
        <label className="block text-sm font-semibold mb-1">이름</label>
        <input
          value={userInfo.name}
          disabled
          className="w-full bg-gray-100 border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">이메일</label>
        <input
          value={userInfo.email}
          disabled
          className="w-full bg-gray-100 border px-3 py-2 rounded"
        />
      </div>

      {/* 사용자가 입력할 추가 정보 */}
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

      <div>
        <label className="block text-sm font-semibold mb-1">생년월일</label>
        <input
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            주소찾기
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">주소</label>
        <input
          value={address1}
          readOnly
          className="w-full border px-3 py-2 rounded bg-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">상세 주소</label>
        <input
          ref={addressRef}
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        회원가입 완료
      </button>
    </div>
  );
}
