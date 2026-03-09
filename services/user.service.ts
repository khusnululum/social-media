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

export const getUserProfile = async (username: string) => {
  const res = await api.get(`/api/users/${username}`);
  return res.data;
};

export const followUser = async (username: string) => {
  const res = await api.post(`/api/follow/${username}`);
  return res.data;
};

export const unfollowUser = async (username: string) => {
  const res = await api.delete(`/api/follow/${username}`);
  return res.data;
};

export const getFollowers = async (username: string) => {
  const res = await api.get(`/api/users/${username}/followers`);
  return res.data;
};

export const getFollowing = async (username: string) => {
  const res = await api.get(`/api/users/${username}/following`);
  return res.data;
};

export const getMyFollowers = async () => {
  const res = await api.get("/api/me/followers");
  return res.data;
};

export const getMyFollowing = async () => {
  const res = await api.get("/api/me/following");
  return res.data;
};
