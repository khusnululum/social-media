"use client";

import { Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Logo from "@/assets/svg/logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchOverlay from "@/components/search/search-overlay";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Input } from "../ui/input";

export default function Navbar({ user }: any) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const isLoggedIn = !!user;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const pathname = usePathname();
  const isAddPostPage = pathname === "/add-post";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/search?q=${value}`,
      );

      const data = await res.json();

      setResults(data?.data?.users ?? []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // detect scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-50 px-4 py-3 max-w-360 mx-auto text-white transition-all duration-300
    ${scrolled ? "backdrop-blur-lg bg-black/60" : "bg-black"}`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* LEFT */}
        {isAddPostPage ? (
          <div className="flex items-center gap-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="p-0"
            >
              <ArrowLeft size={22} />
            </Button>

            <span className="text-lg font-semibold">Add Post</span>
          </div>
        ) : (
          <Button
            onClick={() => router.push("/feed")}
            className="flex items-center gap-3 font-semibold text-lg p-0"
          >
            <Image alt="Logo" src={Logo} width={30} height={30} />
            Sociality
          </Button>
        )}

        {/* DESKTOP SEARCH */}
        <div className="hidden md:flex flex-1 justify-center px-6 relative">
          <div className="w-full max-w-md relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Search"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-9 pr-4 py-2 text-sm outline-none"
            />

            {/* DROPDOWN RESULT */}
            {query && (
              <div className="absolute top-full mt-3 w-full bg-neutral-950 border border-neutral-900 rounded-2xl shadow-xl overflow-hidden">
                {loading && (
                  <div className="p-4 text-center text-neutral-400">
                    Searching...
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <div className="p-4 text-center text-neutral-400">
                    No results found
                  </div>
                )}

                {!loading &&
                  results.map((user: any) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        router.push(`/profile/${user.username}`);
                        setQuery("");
                        setResults([]);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-neutral-900 cursor-pointer"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-neutral-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* MOBILE SEARCH */}
          <div className="md:hidden">
            {searchOpen && (
              <SearchOverlay onClose={() => setSearchOpen(false)} />
            )}

            <Search
              size={20}
              className="cursor-pointer"
              onClick={() => setSearchOpen(true)}
            />
          </div>

          {/* LOGGED IN DESKTOP */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-4 cursor-pointer">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>

                  {/* username desktop */}
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name}
                  </span>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="bg-black border-neutral-900 text-white"
              >
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* DESKTOP BUTTONS */}
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="rounded-full border-neutral-800"
                >
                  Login
                </Button>

                <Button
                  onClick={() => router.push("/register")}
                  className="rounded-full bg-primary-300"
                >
                  Register
                </Button>
              </div>

              {/* MOBILE BURGER */}
              <button className="md:hidden" onClick={() => setOpen(!open)}>
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {!isLoggedIn && open && (
        <div className="flex gap-4 mt-4 md:hidden">
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="flex-1 rounded-full border-neutral-800"
          >
            Login
          </Button>

          <Button
            onClick={() => router.push("/register")}
            className="flex-1 rounded-full bg-primary-300"
          >
            Register
          </Button>
        </div>
      )}
    </div>
  );
}
