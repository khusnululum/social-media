"use client";

import { Bookmark, Grid, Send, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/navigation/bottom-nav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  followUser,
  unfollowUser,
  getMyFollowers,
  getMyFollowing,
  getFollowers,
  getFollowing,
} from "@/services/user.service";
import FollowersModal from "./followers-modal";
import FollowingModal from "./following-modal";
import { getUserPosts } from "@/services/post.service";

interface ProfilePageProps {
  profile: any;
  stats: any;
  posts: any[];
  isMyProfile?: boolean;
  savedPosts?: any[];
}

export default function ProfilePageComponent({
  profile,
  stats,
  posts,
  isMyProfile = false,
}: ProfilePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("gallery");

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () =>
      profile?.isFollowing
        ? unfollowUser(profile.username)
        : followUser(profile.username),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["user-profile", profile.username],
      });

      const previous = queryClient.getQueryData([
        "user-profile",
        profile.username,
      ]);

      queryClient.setQueryData(
        ["user-profile", profile.username],
        (old: any) => ({
          ...old,
          data: {
            ...old.data,
            isFollowing: !old.data.isFollowing,
            counts: {
              ...old.data.counts,
              followers: old.data.isFollowing
                ? old.data.counts.followers - 1
                : old.data.counts.followers + 1,
            },
          },
        }),
      );

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(
        ["user-profile", profile.username],
        context?.previous,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", profile.username],
      });
    },
  });

  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const { data: followersData } = useQuery({
    queryKey: isMyProfile ? ["my-followers"] : ["followers", profile?.username],
    queryFn: () =>
      isMyProfile ? getMyFollowers() : getFollowers(profile.username),
    enabled: followersOpen && !!profile,
  });

  const { data: followingData } = useQuery({
    queryKey: isMyProfile ? ["my-following"] : ["following", profile?.username],
    queryFn: () =>
      isMyProfile ? getMyFollowing() : getFollowing(profile.username),
    enabled: followingOpen && !!profile,
  });

  const { data: userPostsData, isLoading: userPostsLoading } = useQuery({
    queryKey: ["user-posts", profile?.username],
    queryFn: () => getUserPosts(profile.username),
    enabled: !isMyProfile && !!profile,
  });

  const galleryPosts = isMyProfile ? posts : (userPostsData?.data?.posts ?? []);

  const postsCache = queryClient.getQueryData(["posts"]) as any;
  const allPosts =
    postsCache?.pages?.flatMap((page: any) => page.data.posts) ?? [];

  const savedPosts = allPosts.filter((post: any) => post.isSaved);
  const likedPosts = allPosts.filter((post: any) => post.likedByMe);

  if (!profile) {
    return (
      <div className="max-w-360 mx-auto bg-black">
        <div className="p-4 space-y-4 bg-black min-h-screen max-w-150 mx-auto">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-360 mx-auto bg-black">
      <div className="bg-black text-white min-h-screen py-4 px-4 max-w-150 mx-auto">
        {/* HEADER */}
        <div className="space-y-4">
          <div className="md:flex md:justify-between md:items-center space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold text-lg">{profile?.name}</p>
                <p className="text-gray-400 text-sm">@{profile?.username}</p>
              </div>
            </div>

            <div className="flex flex-row gap-4">
              {isMyProfile ? (
                <Button
                  variant="outline"
                  onClick={() => router.push("/edit-profile")}
                  className="flex-1 h-10 rounded-full bg-black border-neutral-900"
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={() => followMutation.mutate()}
                  className={`flex-1 h-10 rounded-full ${
                    profile?.isFollowing
                      ? "bg-transparent border border-neutral-900"
                      : "bg-primary-300"
                  }`}
                >
                  {profile?.isFollowing ? "Following" : "Follow"}
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="bg-black h-10 w-10 border-neutral-900 rounded-full"
              >
                <Send size={20} className="size-5" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-gray-300">{profile?.bio}</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 text-center py-4">
          <div>
            <p className="font-semibold">
              {isMyProfile ? posts.length : galleryPosts.length}
            </p>
            <p className="text-xs text-gray-400">Posts</p>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => setFollowersOpen(true)}
          >
            <p className="font-semibold">{stats?.followers}</p>
            <p className="text-xs text-gray-400">Followers</p>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => setFollowingOpen(true)}
          >
            <p className="font-semibold">{stats?.following}</p>
            <p className="text-xs text-gray-400">Following</p>
          </div>

          <div>
            <p className="font-semibold">{stats?.likes ?? 0}</p>
            <p className="text-xs text-gray-400">Likes</p>
          </div>
        </div>
        {/* Modal State */}
        <FollowersModal
          open={followersOpen}
          onClose={() => setFollowersOpen(false)}
          users={followersData?.data?.users ?? []}
        />

        <FollowingModal
          open={followingOpen}
          onClose={() => setFollowingOpen(false)}
          users={followingData?.data?.users ?? []}
        />

        {/* TABS */}
        <Tabs
          defaultValue="gallery"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 w-full bg-black text-white border-b border-neutral-900 rounded-none">
            <TabsTrigger
              value="gallery"
              className="flex gap-2 hover:text-white"
            >
              <Grid size={18} />
              Gallery
            </TabsTrigger>

            <TabsTrigger value="saved" className="flex gap-2 hover:text-white">
              {isMyProfile ? (
                <Bookmark
                  size={18}
                  className={
                    activeTab === "saved"
                      ? "fill-white text-white"
                      : "text-white"
                  }
                />
              ) : (
                <Heart
                  size={18}
                  className={
                    activeTab === "saved"
                      ? "fill-white text-white"
                      : "text-white"
                  }
                />
              )}

              {isMyProfile ? "Saved" : "Liked"}
            </TabsTrigger>
          </TabsList>

          {/* GALLERY */}
          <TabsContent value="gallery">
            {galleryPosts.length === 0 ? (
              <div className="py-20 text-center text-neutral-400">
                No posts yet
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {galleryPosts.map((post: any) => (
                  <img
                    key={post.id}
                    src={post.imageUrl}
                    onClick={() => router.push(`/post/${post.id}`)}
                    className="aspect-square object-cover rounded-sm cursor-pointer"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* SAVED */}
          {isMyProfile && (
            <TabsContent value="saved">
              {savedPosts.length === 0 ? (
                <p className="text-center py-20 text-neutral-400">
                  {isMyProfile ? "No saved posts yet" : "No liked posts yet"}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {savedPosts.map((post: any) => (
                    <img
                      key={post.id}
                      src={post.imageUrl}
                      className="aspect-square object-cover cursor-pointer"
                      onClick={() => router.push(`/post/${post.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        <BottomNav />
      </div>
    </div>
  );
}
