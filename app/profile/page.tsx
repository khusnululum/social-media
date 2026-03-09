"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/services/user.service";
import { getMyPosts } from "@/services/post.service";
import ProfilePageComponent from "@/components/profile/profile-page";

export default function MyProfilePage() {
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
  });

  const { data: postsData } = useQuery({
    queryKey: ["my-posts"],
    queryFn: getMyPosts,
  });

  return (
    <ProfilePageComponent
      profile={data?.data?.profile}
      stats={data?.data?.stats}
      posts={postsData?.data?.items ?? []}
      savedPosts={data?.data?.profile?.savedPosts ?? []}
      isMyProfile
    />
  );
}
