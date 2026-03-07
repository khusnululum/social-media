"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  getComments,
  createComment,
  deleteComment,
} from "@/services/comment.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Smile } from "lucide-react";
import dayjs from "dayjs";

export default function CommentsModal({
  postId,
  onClose,
}: {
  postId: number;
  onClose: () => void;
}) {
  const [text, setText] = useState("");

  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
  });

  const addMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });
    },
  });

  const comments = data?.data?.comments ?? [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 max-w-md mx-auto">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-black rounded-t-2xl p-4 max-h-[70vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold">Comments</h2>

          <button onClick={onClose}>
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 mt-10">
              <p className="text-white font-semibold">No Comments yet</p>

              <p className="text-sm text-gray-500">Start the conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex-1 space-y-2">
                  <div className="flex gap-3">
                    {comment.author.avatarUrl ? (
                      <img
                        src={comment.author.avatarUrl}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center font-semibold">
                        {getInitials(comment.author.name)}
                      </div>
                    )}

                    <div className="flex-1 text-white">
                      <p className="font-semibold text-xs">
                        {comment.author.username}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {dayjs(comment.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <p className="text-white text-xs">{comment.text}</p>

                  {/* <button
                    onClick={() => deleteMutation.mutate(comment.id)}
                    className="text-red-400 text-xs"
                  >
                    delete
                  </button> */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="relative mt-4 pt-3">
          <div className="relative flex gap-4">
            {/* Emoji Button */}
            <button
              type="button"
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-neutral-900 text-white p-3"
            >
              <Smile size={18} />
            </button>

            {/* Input */}
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && text.trim()) {
                  addMutation.mutate({ postId, text });
                }
              }}
              placeholder="Add Comment"
              className="w-full bg-neutral-950 text-white rounded-xl pl-4 text-sm border border-neutral-900 focus:outline-none"
            />

            {/* Post Button */}
            <button
              onClick={() =>
                addMutation.mutate({
                  postId,
                  text,
                })
              }
              disabled={!text.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-200 text-sm font-bold disabled:text-neutral-600"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
