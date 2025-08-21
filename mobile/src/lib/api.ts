import Constants from "expo-constants";
import axios from "axios";

const { API_BASE } = Constants.expoConfig!.extra as any;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export async function ping() {
  const { data } = await api.get("/api/health");
  return data;
}
