import axios from "axios";

export type User = {
    email: string,
    loginType: 'default' | 'google' | 'kakao',
    // lastLoginTime: string,
    name: string | null,
}

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

// 로그인 Task
export const loginAPI = async (email: string, password: string): Promise<User> => {
    const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password },
        {
            withCredentials: true,
        }
    );
    return res.data as User;
};

// Google
export const googleSignupAPI = async (payload: SignupPayload): Promise<User> => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-signup`,
    payload,
    { withCredentials: true }
  );
  return res.data as User;
};

// Kakao
export const kakaoSignupAPI = async (payload: SignupPayload): Promise<User> => {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao-signup`,
    payload,
    { withCredentials: true }
  );
  return res.data as User;
};
