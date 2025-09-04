// src/lib/axiosInstance.ts
import axios from "axios";

const isServer = typeof window === "undefined";

const api = axios.create({
  baseURL: isServer
    ? process.env.SERVER_API_URL || "http://spring-backend.recruitai.local:8080"
    : process.env.NEXT_PUBLIC_API_URL || "",   // 브라우저는 '' → /api/... 그대로 나감
  withCredentials: true,
});

export default api;
