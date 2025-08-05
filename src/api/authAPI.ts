export type User = {
    email: string,
    loginType: 'default' | 'google' | 'kakao',
    // lastLoginTime: string,
    name: string | null,
}

// 로그인 Task
export const loginAPI = async (email: string, password: string): Promise<User> => {
    
}

// Google

// Kakao