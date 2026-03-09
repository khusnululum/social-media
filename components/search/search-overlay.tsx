"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/services/user.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SearchOverlay({ onClose }: any) {
  const [query, setQuery] = useState("");

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

  return (
    <div className="fixed inset-0 bg-black z-100 px-4 pt-4 text-white">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center flex-1 bg-neutral-900 rounded-full px-4 py-2">
          <Search size={18} className="text-gray-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent outline-none ml-2 flex-1 text-sm"
          />

          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>

        <button onClick={onClose}>
          <X size={22} />
        </button>
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
            <div key={user.id} className="flex items-center gap-3">
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
    </div>
  );
}
