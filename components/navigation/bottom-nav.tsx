"use client";

import { Home, Plus, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full h-16 px-4 max-w-md mx-auto">
      <div className="bg-neutral-950 rounded-full flex items-center justify-between px-8 py-3 shadow-lg">
        <button
          onClick={() => router.push("/feed")}
          className="flex flex-col justify-center items-center"
        >
          <Home className="text-primary-300" />
          <p className="text-xs text-primary-300">Home</p>
        </button>

        <button className="bg-primary-300 text-white w-11 h-11 rounded-full flex items-center justify-center">
          <Plus />
        </button>

        <button
          onClick={() => router.push("/profile")}
          className="flex flex-col justify-center items-center"
        >
          <User className="text-white" />
          <p className="text-xs text-white">Profile</p>
        </button>
      </div>
    </div>
  );
}
