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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    router.push(`/search?q=${query}`);
    setSearchOpen(false);
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
      className={`sticky top-0 z-50 px-4 py-3 text-white transition-all duration-300
      ${scrolled ? "backdrop-blur-lg bg-black/60" : "bg-black"}`}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Button
          onClick={() => router.push("/feed")}
          className="flex items-center gap-3 font-semibold text-lg p-0"
        >
          <Image alt="Logo" src={Logo} width={24} height={24} />
          Sociality
        </Button>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border border-neutral-800 rounded-full px-3 py-1 text-sm outline-none"
              />

              <button type="button" onClick={() => setSearchOpen(false)}>
                <X size={18} />
              </button>
            </form>
          ) : (
            <Search
              size={20}
              className="cursor-pointer"
              onClick={() => setSearchOpen(true)}
            />
          )}

          {/* Logged In */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
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
            <button onClick={() => setOpen(!open)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* MENU (Before Login) */}
      {!isLoggedIn && open && (
        <div className="flex gap-4 mt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="flex-1 rounded-full bg-transparent border-neutral-800"
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
