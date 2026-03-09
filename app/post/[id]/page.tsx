"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getPostDetail } from "@/services/post.service";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Heart, MessageCircle, Bookmark, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  createComment,
  deleteComment,
} from "@/services/comment.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

dayjs.extend(relativeTime);

export default function PostDetailPage({
  postId,
  onClose,
}: {
  postId: number;
  onClose: () => void;
}) {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: () => getPostDetail(Number(id)),
  });

  const post = data?.data;
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const onEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const queryClient = useQueryClient();

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => getComments(id),
  });
  const comments = commentsData?.data?.comments ?? [];

  const addMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setText("");

      queryClient.invalidateQueries({
        queryKey: ["comments", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["post-detail", id],
      });
    },
  });

  const emojiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 bg-black min-h-screen">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  console.log(data);

  return (
    <div className="bg-black text-white min-h-screen max-w-md mx-auto">
      {/* IMAGE */}
      <div className="w-full">
        <img src={post.imageUrl} className="w-full p-4" />
      </div>

      <div className="m-4 p-4 bg-neutral-950 space-y-4 min-h-screen rounded-2xl">
        {/* AUTHOR */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
          </Avatar>

          <div>
            <p className="font-semibold">{post.author.username}</p>
            <p className="text-xs text-neutral-400">
              {dayjs(post.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* CAPTION */}
        <p className="text-sm">
          <span className="font-semibold mr-2">{post.author.username}</span>
          {post.caption}
        </p>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto border-t border-neutral-900">
          {commentsLoading ? (
            <p className="text-center text-gray-400 mt-4">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 mt-4">
              <p className="text-white font-semibold">No Comments yet</p>
              <p className="text-sm text-gray-500">Start the conversation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author?.avatarUrl} />
                      <AvatarFallback>
                        {getInitials(comment.author?.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-semibold text-xs">
                        {comment.author?.username}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {dayjs(comment.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>

                  <p className="text-white text-xs">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between m-0 pt-2 border-t border-neutral-900">
          <div className="flex">
            <Button className="flex items-center gap-2">
              <Heart size={20} className="size-5" />
              <span>{post.likeCount}</span>
            </Button>

            <Button className="flex items-center gap-2">
              <MessageCircle size={20} className="size-5" />
              <span>{post.commentCount}</span>
            </Button>
          </div>

          <Button className="flex">
            <Bookmark size={20} className="size-5" />
            <Share size={20} className="size-5" />
          </Button>
        </div>

        {/* COMMENTS */}
        <div className="relative flex flex-row bg-neutral-950 gap-2">
          {/* Input */}
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) {
                addMutation.mutate({
                  postId: id,
                  text,
                });
              }
            }}
            placeholder="Add Comment"
            className="flex-1 bg-neutral-900 text-white rounded-xl text-sm border border-neutral-900"
          />

          {/* Emoji Button */}
          <Button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="absolute right-18 top-0.5 text-white"
          >
            <Smile
              size={20}
              className={showEmoji ? "text-primary-300" : "text-white"}
            />
          </Button>
          {/* Emoji Picker */}
          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-14 left-0 z-50">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={Theme.DARK}
                height={350}
                width={300}
              />
            </div>
          )}

          {/* Post Button */}
          <Button
            onClick={() =>
              addMutation.mutate({
                postId: id,
                text,
              })
            }
            disabled={!text.trim()}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
