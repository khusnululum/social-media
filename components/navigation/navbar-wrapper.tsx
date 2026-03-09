"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/services/user.service";
import Navbar from "./navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/login", "/register"];
  if (hideNavbarRoutes.includes(pathname)) return null;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
    enabled: !!token,
  });

  const user = data?.data?.profile;

  return <Navbar user={user} />;
}
