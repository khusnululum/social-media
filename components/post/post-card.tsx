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

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post-detail", post.id] });

      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousDetail = queryClient.getQueryData(["post-detail", post.id]);

      const toggle = (p: any) => ({
        ...p,
        likedByMe: !p.likedByMe,
        likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1,
      });

      // update FEED cache
      queryClient.setQueryData(["posts"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((p: any) =>
                p.id === post.id ? toggle(p) : p,
              ),
            },
          })),
        };
      });

      // update POST DETAIL cache
      queryClient.setQueryData(["post-detail", post.id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          data: toggle(old.data),
        };
      });

      return { previousPosts, previousDetail };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      queryClient.setQueryData(
        ["post-detail", post.id],
        context?.previousDetail,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-detail", post.id] });
    },
  });

  const handleLike = () => {
    if (likeMutation.isPending) return;

    likeMutation.mutate();
  };

  // Save & Unsave Mutation
  const saveMutation = useMutation({
    mutationFn: () => (saved ? unsavePost(post.id) : savePost(post.id)),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old: any) => {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              posts: page.data.posts.map((p: any) => {
                if (p.id !== post.id) return p;

                return {
                  ...p,
                  isSaved: !p.isSaved,
                };
              }),
            },
          })),
        };
      });

      return { previousPosts };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSave = () => {
    if (saveMutation.isPending) return;

    saveMutation.mutate();
  };

  const cachedPosts: any = queryClient.getQueryData(["posts"]);

  const cachedPost =
    cachedPosts?.pages
      ?.flatMap((page: any) => page.data.posts)
      ?.find((p: any) => p.id === post.id) || post;

  const liked = cachedPost.likedByMe;
  const likes = cachedPost.likeCount;
  const saved = cachedPost.isSaved;

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
            className="w-10 h-10 rounded-full hover:underline hover:cursor-pointer object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center font-semibold">
            {getInitials(post.author.name)}
          </div>
        )}

        <div>
          <p
            onClick={() => router.push(`/profile/${post.author.username}`)}
            className="font-semibold hover:underline  hover:cursor-pointer"
          >
            {post.author.name}
          </p>
          <p className="text-xs text-gray-400">
            {dayjs(post.createdAt).fromNow()}
          </p>
        </div>
      </div>
      {/* Image */}
      <Button
        onDoubleClick={handleLike}
        className="aspect-square w-full overflow-hidden rounded-xl"
      >
        <img
          src={post.imageUrl}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => router.push(`/post/${post.id}`)}
          onDoubleClick={handleLike}
        />
      </Button>

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
          className="font-semibold mt-2 hover:underline  hover:cursor-pointer"
        >
          {post.author.username}
        </p>
        <p className="mt-2 text-sm">
          {displayedCaption}

          {!expanded && isLong && "..."}

          {isLong && (
            <Button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-primary-200 font-bold"
            >
              {expanded ? "Show Less" : "Show More"}
            </Button>
          )}
        </p>
      </div>
    </div>
  );
}
