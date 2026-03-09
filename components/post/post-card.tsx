"use client";

import { Heart, MessageCircle, Send, Bookmark, icons } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePost, unsavePost } from "@/services/post.service";
import CommentsModal from "@/components/comments/CommentsModal";
import { likePost, unlikePost } from "@/services/post.service";
import LikesModal from "@/components/likes/LikesModal";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

dayjs.extend(relativeTime);

export default function PostCard({ post }: any) {
  const likeCount = post.likeCount ?? 0;
  const commentCount = post.commentCount ?? 0;
  const likedByMe = post.likedByMe ?? false;

  const [liked, setLiked] = useState<boolean>(likedByMe);
  const [likes, setLikes] = useState<number>(likeCount);

  const [saved, setSaved] = useState<boolean>(post.isSaved || false);

  const [showComments, setShowComments] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const router = useRouter();

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
  const likeMutation = useMutation({
    mutationFn: () => (liked ? unlikePost(post.id) : likePost(post.id)),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });

  useEffect(() => {
    setLiked(post.likedByMe || false);
    setLikes(post.likeCount || 0);
  }, [post.likedByMe, post.likeCount]);

  const handleLike = () => {
    if (likeMutation.isPending) return;

    setLiked((prev) => !prev);

    setLikes((prev) => (liked ? prev - 1 : prev + 1));

    likeMutation.mutate();
  };

  // Save & Unsave Mutation
  const saveMutation = useMutation({
    mutationFn: (isSaved: boolean) =>
      isSaved ? unsavePost(post.id) : savePost(post.id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
    },
  });

  const handleSave = () => {
    if (saveMutation.isPending) return;

    const current = saved;

    setSaved(!current); // update UI dulu
    saveMutation.mutate(current); // kirim state lama
  };

  useEffect(() => {
    setSaved(post.isSaved ?? false);
  }, [post.isSaved]);

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
          <img
            onClick={() => router.push(`/profile/${post.author.username}`)}
            src={post.author.avatarUrl}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center font-semibold">
            {getInitials(post.author.name)}
          </div>
        )}

        <div>
          <p
            onClick={() => router.push(`/profile/${post.author.username}`)}
            className="font-semibold"
          >
            {post.author.name}
          </p>
          <p className="text-xs text-gray-400">
            {dayjs(post.createdAt).fromNow()}
          </p>
        </div>
      </div>
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden rounded-xl">
        <img
          src={post.imageUrl}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => router.push(`/post/${post.id}`)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-3">
        {/* Left buttons */}
        <div className="flex items-center gap-6">
          {/* Like */}
          {showLikes && (
            <LikesModal postId={post.id} onClose={() => setShowLikes(false)} />
          )}
          <div className="flex justify-center items-center">
            <Button onClick={handleLike} className="flex items-center">
              <Heart
                size={20}
                className={liked ? "fill-pink-500 text-pink-500" : "text-white"}
              />
            </Button>
            <p
              onClick={() => setShowLikes(true)}
              className="text-sm hover:cursor-pointer"
            >
              {likes}
            </p>
          </div>

          {/* Comment */}
          {showComments && (
            <CommentsModal
              postId={post.id}
              onClose={() => setShowComments(false)}
            />
          )}
          <Button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1"
          >
            <MessageCircle size={20} />
            <span className="text-sm">{commentCount}</span>
          </Button>

          {/* Share */}
          <Button className="flex items-center gap-1">
            <Send size={20} />
            <span className="text-sm">{post.sharesCount || 0}</span>
          </Button>
        </div>

        {/* Save */}
        <Button onClick={handleSave}>
          <Bookmark
            size={20}
            className={saved ? "fill-white text-white" : "text-white"}
          />
        </Button>
      </div>

      {/* Caption */}
      <div>
        <p
          onClick={() => router.push(`/profile/${post.author.username}`)}
          className="font-semibold mt-2"
        >
          {post.author.username}
        </p>
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
