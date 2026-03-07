"use client";

import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPostLikes } from "@/services/post.service";

export default function LikesModal({
  postId,
  onClose,
}: {
  postId: number;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["postLikes", postId],
    queryFn: () => getPostLikes(postId),
  });

  const users = data?.data?.users ?? [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-black rounded-t-2xl p-5 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold text-lg">Likes</h2>

          <button onClick={onClose}>
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading && <p className="text-gray-400 text-sm">Loading...</p>}

          {users.map((user: any) => (
            <div key={user.id} className="flex items-center justify-between">
              {/* User Info */}
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center font-semibold">
                    {getInitials(user.name)}
                  </div>
                )}

                <div>
                  <p className="text-white font-semibold text-sm">
                    {user.name}
                  </p>

                  <p className="text-gray-400 text-xs">{user.username}</p>
                </div>
              </div>

              {/* Follow Button */}
              {user.isMe ? null : user.isFollowedByMe ? (
                <button className="px-4 py-1 rounded-full border border-neutral-700 text-white text-sm">
                  Following
                </button>
              ) : (
                <button className="px-4 py-1 rounded-full bg-primary-300 text-white text-sm">
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
