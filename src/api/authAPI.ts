import axios from "axios";

export type User = {
    email: string,
    loginType: 'default' | 'google' | 'kakao',
    // lastLoginTime: string,
    name: string | null,
}

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

// Kakao