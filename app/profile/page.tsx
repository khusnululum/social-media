"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/services/user.service";
import { Bookmark, Grid, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyPosts } from "@/services/post.service";
import BottomNav from "@/components/navigation/bottom-nav";
import { useState } from "react";

export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["my-posts"],
    queryFn: getMyPosts,
  });

  const posts = postsData?.data?.items ?? [];
  const profile = data?.data?.profile;
  const stats = data?.data?.stats;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("gallery");
  const savedPosts = profile?.savedPosts ?? [];

  const getInitials = (name?: string) => {
    if (!name) return "";

    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 bg-black min-h-screen">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen py-4 px-4 max-w-md mx-auto">
      {/* HEADER */}
      <div className="space-y-4">
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
          <Button
            variant="outline"
            onClick={() => router.push("/edit-profile")}
            className="flex-1 h-10 rounded-full bg-black border-neutral-900"
          >
            Edit Profile
          </Button>
          {/* Share */}
          <Button
            variant="outline"
            size="icon"
            className="bg-black h-10 border-neutral-900 rounded-full"
          >
            <Send size={20} className="size-5" />
          </Button>
        </div>

        <p className="text-sm text-gray-300">{profile?.bio}</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 text-center border-l-neutral-100 py-4">
        <div>
          <p className="font-semibold">{stats?.posts ?? 0}</p>
          <p className="text-xs text-gray-400">Posts</p>
        </div>

        <div>
          <p className="font-semibold">{stats?.followers ?? 0}</p>
          <p className="text-xs text-gray-400">Followers</p>
        </div>

        <div>
          <p className="font-semibold">{stats?.following ?? 0}</p>
          <p className="text-xs text-gray-400">Following</p>
        </div>

        <div>
          <p className="font-semibold">{stats?.likes ?? 0}</p>
          <p className="text-xs text-gray-400">Likes</p>
        </div>
      </div>

      {/* TABS */}
      <Tabs
        defaultValue="gallery"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 w-full bg-black text-white border-b border-neutral-900 rounded-none">
          <TabsTrigger value="gallery" className="flex gap-2">
            <Grid size={18} />
            Gallery
          </TabsTrigger>

          <TabsTrigger value="saved" className="flex gap-2">
            <Bookmark
              size={18}
              className={
                activeTab === "saved" ? "fill-white text-white" : "text-white"
              }
            />
            Saved
          </TabsTrigger>
        </TabsList>

        {/* GALLERY */}
        <TabsContent value="gallery">
          {postsLoading ? (
            <div className="py-20 text-center text-neutral-400">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Your story starts here
                </h3>

                <p className="text-neutral-400 text-sm leading-relaxed">
                  Share your first post and let the world see your moments,
                  passions, and memories. Make this space truly yours.
                </p>
              </div>

              <Button
                onClick={() => router.push("/add-post")}
                className="rounded-full h-10 px-8 bg-primary-300"
              >
                Upload My First Post
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post: any) => (
                <img
                  key={post.id}
                  src={post.imageUrl}
                  onClick={() => router.push(`/post/${post.id}`)}
                  className="aspect-square object-cover rounded-sm"
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* SAVED */}
        <TabsContent value="saved">
          {savedPosts.length === 0 ? (
            <p className="text-center py-20 text-neutral-400">
              No saved posts yet
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {savedPosts.map((post: any) => (
                <img
                  key={post.id}
                  src={post.imageUrl}
                  className="aspect-square object-cover"
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
}
