"use client";

import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost } from "@/services/post.service";
import { savePost, unsavePost } from "@/services/post.service";
import CommentsModal from "@/components/comments/CommentsModal";

dayjs.extend(relativeTime);

export default function PostCard({ post }: any) {
  const likeCount = post.likeCount ?? 0;
  const commentCount = post.commentCount ?? 0;
  const likedByMe = post.likedByMe ?? false;

  const [liked, setLiked] = useState<boolean>(likedByMe);
  const [likes, setLikes] = useState<number>(likeCount);

  const [saved, setSaved] = useState<boolean>(post.isSaved || false);

  const [showComments, setShowComments] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const queryClient = useQueryClient();

  // Like Mutation
  const mutation = useMutation({
    mutationFn: () => likePost(post.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  useEffect(() => {
    setLiked(post.isLiked || false);
    setLikes(post.likesCount || 0);
  }, [post.isLiked, post.likeCount]);

  const handleLike = () => {
    if (mutation.isPending) return;

    setLiked((prev) => !prev);

    setLikes((prev) => (liked ? prev - 1 : prev + 1));

    mutation.mutate();
  };

  // Save & Unsave Mutation
  const saveMutation = useMutation({
    mutationFn: () => (saved ? unsavePost(post.id) : savePost(post.id)),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  const handleSave = () => {
    setSaved((prev) => !prev);
    saveMutation.mutate();
  };

  const [expanded, setExpanded] = useState(false);

  const MAX_LENGTH = 100;

  const isLong = post.caption.length > MAX_LENGTH;

  const displayedCaption = expanded
    ? post.caption
    : post.caption.slice(0, MAX_LENGTH);

  return (
    <div className="p-4 bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {post.author.avatarUrl ? (
          <img src={post.author.avatarUrl} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center font-semibold">
            {getInitials(post.author.name)}
          </div>
        )}

        <div>
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-xs text-gray-400">
            {dayjs(post.createdAt).fromNow()}
          </p>
        </div>
      </div>
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden rounded-xl">
        <img
          src={post.imageUrl}
          className="w-full h-full object-cover"
          onDoubleClick={handleLike}
        />
      </div>
      {/* Actions */}
      <div className="flex justify-between items-center mt-3">
        {/* Left buttons */}
        <div className="flex items-center gap-5">
          {/* Like */}
          <button onClick={handleLike} className="flex items-center gap-1">
            <Heart
              size={20}
              className={liked ? "fill-pink-500 text-pink-500" : "text-white"}
            />
            <span className="text-sm">{likeCount}</span>
          </button>

          {/* Comment */}
          {showComments && (
            <CommentsModal
              postId={post.id}
              onClose={() => setShowComments(false)}
            />
          )}
          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1"
          >
            <MessageCircle size={20} />
            <span className="text-sm">{commentCount}</span>
          </button>

          {/* Share */}
          <button className="flex items-center gap-1">
            <Send size={20} />
            <span className="text-sm">{post.sharesCount || 0}</span>
          </button>
        </div>

        {/* Save */}
        <button onClick={handleSave}>
          <Bookmark
            size={20}
            className={saved ? "fill-white text-white" : "text-white"}
          />
        </button>
      </div>

      {/* Caption */}
      <div>
        <p className="font-semibold mt-2">{post.author.username}</p>
        <p className="mt-2 text-sm">
          {displayedCaption}

          {!expanded && isLong && "..."}

          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-primary-200 font-bold"
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
