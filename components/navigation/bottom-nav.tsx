"use client";

import { Home, Plus, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black border border-neutral-900 rounded-full px-8 py-3 flex justify-between items-center">
      {/* Home */}
      <Button
        onClick={() => router.push("/feed")}
        className="flex flex-col items-center gap-0"
      >
        <Home
          size={24}
          className={
            pathname === "/feed"
              ? "text-primary-300 size-5"
              : "text-white size-5"
          }
        />
        <p
          className={`text-xs ${
            pathname === "/feed" ? "text-primary-300" : "text-white"
          }`}
        >
          Home
        </p>
      </Button>

      {/* Add Post */}
      <Button
        onClick={() => router.push("/add-post")}
        className="bg-primary-300 text-white rounded-full"
      >
        <Plus size={24} className="size-5" />
      </Button>

      {/* Profile */}
      <Button
        onClick={() => router.push("/profile")}
        className="flex flex-col items-center gap-0"
      >
        <User
          size={24}
          className={
            pathname === "/profile"
              ? "text-primary-300 size-5"
              : "text-white size-5"
          }
        />
        <p
          className={`text-xs ${
            pathname === "/profile" ? "text-primary-300" : "text-white"
          }`}
        >
          Profile
        </p>
      </Button>
    </div>
  );
}
