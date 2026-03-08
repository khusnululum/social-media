import { api } from "@/lib/axios";

export const getMyProfile = async () => {
  const res = await api.get("/api/me");
  return res.data;
};
