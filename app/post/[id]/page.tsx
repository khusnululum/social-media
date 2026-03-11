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
import {
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  deletePost,
} from "@/services/post.service";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getMe } from "@/services/user.service";

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
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: () => getPostDetail(Number(id)),
  });

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const currentUser = meData?.data?.user;

  const post = data?.data;
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const onEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: () => (liked ? unlikePost(post.id) : likePost(post.id)),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["post-detail", id],
      });

      const previousPost = queryClient.getQueryData(["post-detail", id]);

      queryClient.setQueryData(["post-detail", id], (old: any) => {
        if (!old) return old;

        const p = old.data;

        return {
          ...old,
          data: {
            ...p,
            likedByMe: !p.likedByMe,
            likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1,
          },
        };
      });

      return { previousPost };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["post-detail", id], context?.previousPost);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["post-detail", id],
      });
    },
  });

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: () => (saved ? unsavePost(post.id) : savePost(post.id)),

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

  const handleSave = () => {
    if (saveMutation.isPending) return;

    saveMutation.mutate();
  };

  const queryClient = useQueryClient();

  const cachedPost =
    (queryClient.getQueryData(["post-detail", id]) as any)?.data || post;

  const liked = cachedPost?.likedByMe ?? false;
  const likeCount = cachedPost?.likeCount ?? 0;
  const saved = cachedPost?.isSaved ?? false;

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

  const handleDelete = () => {
    if (!confirm("Delete this post?")) return;

    deleteMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });

      router.push("/feed");
    },
  });

  const isMyPost =
    currentUser && post ? currentUser.id === post.author.id : false;

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
      <div className="bg-black max-w-360 mx-auto">
        <div className="p-4 space-y-4 bg-black min-h-screen max-w-150 mx-auto">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
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
  // console.log("ME:", currentUser);
  // console.log("POST AUTHOR:", post?.author?.id);
  // console.log("IS MY POST:", isMyPost);

  return (
    <div className="bg-black max-w-360 mx-auto md:flex md:items-center md:justify-center">
      <div className="bg-black text-white min-h-screen max-w-6xl mx-auto md:flex md:gap-6 px-4">
        {/* IMAGE */}
        <div className="md:w-2/3 flex items-center justify-center">
          <img src={post.imageUrl} className="w-full object-cover rounded-xl" />
        </div>

        <div className="md:w-1/3 md:my-auto flex flex-col h-[calc(100vh-120px)] bg-neutral-950 p-4 rounded-2xl md:h-[85vh]">
          {/* AUTHOR */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 object-cover">
              <AvatarImage src={post.author.avatarUrl} />
              <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold">{post.author.username}</p>
              <p className="text-xs text-neutral-400">
                {dayjs(post.createdAt).fromNow()}
              </p>
            </div>

            {/* DELETE BUTTON */}

            {isMyPost && (
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={18} />
              </Button>
            )}
          </div>

          {/* CAPTION */}
          <p className="text-sm py-4 mt-4 border-t border-neutral-900">
            <span className="font-semibold mr-2">{post.author.username}</span>
            {post.caption}
          </p>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto border-t border-neutral-900 py-4">
            {commentsLoading ? (
              <p className="text-center text-gray-400 mt-4">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 mt-4">
                <p className="text-white font-semibold">No Comments yet</p>
                <p className="text-sm text-neutral-500">
                  Start the conversation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={comment.author?.avatarUrl}
                          className="w-10 h-10 object-cover"
                        />
                        <AvatarFallback>
                          {getInitials(comment.author?.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-bold text-sm">
                          {comment.author?.username}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {dayjs(comment.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>

                    <p className="text-white text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
            <div className="flex gap-4">
              {/* LIKE */}
              <Button onClick={handleLike} className="flex items-center gap-2">
                <Heart
                  size={20}
                  className={
                    liked ? "fill-pink-500 text-pink-500" : "text-white"
                  }
                />
                <span>{likeCount}</span>
              </Button>

              {/* COMMENT */}
              <Button className="flex items-center gap-2">
                <MessageCircle size={20} />
                <span>{comments.length}</span>
              </Button>
            </div>

            {/* SAVE */}
            <Button onClick={handleSave}>
              <Bookmark
                size={20}
                className={saved ? "fill-white text-white" : "text-white"}
              />
            </Button>
          </div>

          {/* COMMENTS */}
          <div className="relative flex flex-row bg-neutral-950 gap-2 bottom-0">
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
    </div>
  );
}
