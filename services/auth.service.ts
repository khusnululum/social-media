import { api } from "@/lib/axios";

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post("/api/auth/login", data);
  return res.data;
};
