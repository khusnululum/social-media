import { api } from "@/lib/axios";

export const getComments = async (postId: number) => {
  const res = await api.get(`/api/posts/${postId}/comments`);
  return res.data;
};

export const createComment = async ({
  postId,
  text,
}: {
  postId: number;
  text: string;
}) => {
  const res = await api.post(`/api/posts/${postId}/comments`, {
    text,
  });
  return res.data;
};

export const deleteComment = async (commentId: number) => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};
