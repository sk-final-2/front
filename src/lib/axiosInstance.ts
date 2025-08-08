import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // ✅ reissue 요청 자체면 재시도 안 함 (절대경로/상대경로 모두 체크)
    if (
      originalRequest.url?.includes("/auth/reissue") ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // ✅ 토큰 만료 시 재발급 시도
    if (error.response?.status === 401) {
      originalRequest._retry = true;
      try {
        await axiosInstance.post("/api/auth/reissue");
        return axiosInstance(originalRequest);
      } catch (err) {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
