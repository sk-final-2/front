import axiosInstance from "@/lib/axiosInstance";

export type User = {
    email: string,
    loginType?: 'default' | 'google' | 'kakao',
    // lastLoginTime: string,
    name: string | null,
}

export type LoginResponse = {
  code: string;
  data: {
    email: string;
    name: string;
    provider: "LOCAL" | "GOOGLE" | "KAKAO";
  };
  message: string;
  status: number;
};


// 첫 소셜 로그인시 회원가입
export type SignupPayload = {
  name: string;
  email: string;
  gender: "MALE" | "FEMALE";
  birth: string;
  zipcode: string;
  address1: string;
  address2: string;
};

export type UserInfoResponse = {
  status: number;
  code: string;
  message: string;
  data: User;
};

// 로그인 Task
export const loginAPI = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password },
        {
            withCredentials: true,
        }
    );
    return res.data;
};

// Google
export const googleSignupAPI = async (payload: SignupPayload): Promise<LoginResponse> => {
  const res = await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-signup`,
    payload,
    { withCredentials: true }
  );
  return res.data;
};

// Kakao
export const kakaoSignupAPI = async (payload: SignupPayload): Promise<LoginResponse> => {
  const res = await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao-signup`,
    payload,
    { withCredentials: true }
  );
  return res.data;
};

//사용자 정보 불러오기
export const fetchUserInfo = async (): Promise<UserInfoResponse> => {
  const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/api/mypage/info`, {
    withCredentials: true,
  });
  return res.data;
};

// 로그아웃
export const logoutServerAPI = async () => {
  await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
    {},
    { withCredentials: true }
  );
};
