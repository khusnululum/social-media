"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/user.service";
import ProfilePageComponent from "@/components/profile/profile-page";
import { getUserPosts } from "@/services/post.service";

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: () => getUserProfile(username),
  });

  const { data: postsData } = useQuery({
    queryKey: ["user-posts", username],
    queryFn: () => getUserPosts(username),
  });

  return (
    <ProfilePageComponent
      profile={data?.data}
      stats={data?.data?.counts}
      posts={postsData?.data?.items ?? []}
      isMyProfile={false}
    />
  );
}
