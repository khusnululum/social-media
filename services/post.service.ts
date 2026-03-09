import { api } from "@/lib/axios";

export const getPosts = async ({ pageParam = 1 }) => {
  const res = await api.get("/api/posts", {
    params: {
      page: pageParam,
      limit: 20,
    },
  });

  return res.data;
};

export const likePost = async (postId: number) => {
  const res = await api.post(`/api/posts/${postId}/like`);
  return res.data;
};

export const unlikePost = async (postId: number) => {
  const res = await api.delete(`/api/posts/${postId}/like`);
  return res.data;
};

export const getPostLikes = async (postId: number) => {
  const res = await api.get(`/api/posts/${postId}/likes`);
  return res.data;
};

export const savePost = async (postId: number) => {
  const res = await api.post(`/api/posts/${postId}/save`);
  return res.data;
};

export const unsavePost = async (postId: number) => {
  const res = await api.delete(`/api/posts/${postId}/save`);
  return res.data;
};

export const createPost = async (data: FormData) => {
  const res = await api.post("/api/posts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getMyPosts = async () => {
  const res = await api.get("/api/me/posts");
  return res.data;
};

export const getPostDetail = async (id: number) => {
  const res = await api.get(`/api/posts/${id}`);
  return res.data;
};

export const getUserPosts = async (username: string) => {
  const res = await api.get(`/api/users/${username}/posts`);
  return res.data;
};
