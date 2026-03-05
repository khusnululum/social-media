import { api } from "@/lib/axios";

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post("/api/auth/login", data);
  return res.data;
};

export const registerUser = async (data: {
  email: string;
  username: string;
  phoneNumber: number;
  password: string;
  confirmPassword: string;
}) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};
