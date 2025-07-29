import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // .env 파일에 API 기본 주소를 설정
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;