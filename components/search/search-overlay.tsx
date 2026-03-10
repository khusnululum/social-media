"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/services/user.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRef } from "react";

export default function SearchOverlay({ onClose }: any) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const pathname = usePathname();

  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      onClose();
    }
    prevPath.current = pathname;
  }, [pathname]);

  const { data, isLoading } = useQuery({
    queryKey: ["search-users", query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
  });

  const users = data?.data?.users ?? [];

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black z-50 px-4 pt-4 text-white">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full bg-neutral-900 border border-neutral-800 outline-none pl-10 flex-1 text-sm"
          />
        </div>

        <Button onClick={onClose}>
          <X size={22} />
        </Button>
      </div>

      {/* Results */}
      <div className="mt-6 space-y-5">
        {isLoading && (
          <p className="text-center text-neutral-400">Searching...</p>
        )}

        {!isLoading && query && users.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-32 text-center">
            <p className="text-white font-medium">No results found</p>
            <p className="text-neutral-400 text-sm">Change your keyword</p>
          </div>
        )}

        {!isLoading &&
          users.map((user: any) => (
            <div
              key={user.id}
              onClick={() => {
                router.push(`/profile/${user.username}`);
                setQuery("");
                setResults([]);
              }}
              className="flex items-center gap-3"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-neutral-400">@{user.username}</p>
              </div>
            </div>
          ))}
      </div>
    </div>,
    document.body,
  );
}
