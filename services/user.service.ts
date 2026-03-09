import { api } from "@/lib/axios";

export const getMyProfile = async () => {
  const res = await api.get("/api/me");
  return res.data;
};

export const updateProfile = async (formData: FormData) => {
  const res = await api.patch("/api/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const searchUsers = async (q: string) => {
  const res = await api.get(`/api/users/search?q=${q}`);
  return res.data;
};
