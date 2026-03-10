"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/post.service";
import PostCard from "@/components/post/post-card";
import BottomNav from "@/components/navigation/bottom-nav";
import { useEffect } from "react";
import LoadingScreen from "@/components/ui/loading-screen";

export default function FeedPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: getPosts,
      initialPageParam: 1,

      getNextPageParam: (lastPage, pages) => {
        if (!lastPage.data.posts.length) return undefined;
        return pages.length + 1;
      },
    });

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        if (hasNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="bg-black">
      <div className="max-w-150 mx-auto pb-28 bg-black">
        {data?.pages.map((page, i) => (
          <div key={i}>
            {(page.data?.posts ?? []).map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ))}

        <div className="text-center py-4">
          {isFetchingNextPage && "Loading..."}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
