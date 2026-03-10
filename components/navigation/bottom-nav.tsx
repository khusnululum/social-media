"use client";

import { Home, Plus, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Home", icon: Home, path: "/feed" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md md:w-70 bg-neutral-950 border border-neutral-900 rounded-full px-8 py-1 flex justify-between items-center">
      {/* Tabs */}
      <div className="flex flex-1 justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.path;

          return (
            <Button
              key={tab.name}
              onClick={() => router.push(tab.path)}
              className="relative flex flex-col items-center justify-center gap-0"
            >
              {/* Icon */}
              <Icon
                size={20}
                className={
                  active ? "text-primary-300 size-5" : "text-white size-5"
                }
              />

              {/* Text */}
              <p
                className={`text-xs ${
                  active ? "text-primary-300" : "text-white"
                }`}
              >
                {tab.name}
              </p>

              {/* Animated underline */}
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 h-0.5 w-8 bg-primary-300 rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </Button>
          );
        })}
      </div>

      {/* Add Post */}
      <Button
        onClick={() => router.push("/add-post")}
        className="absolute left-1/2 -translate-x-1/2 bg-primary-300 text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus size={24} className="size-6 mx-1" />
      </Button>
    </div>
  );
}

//     <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black border border-neutral-900 rounded-full px-8 py-3 flex justify-between items-center">
//       {/* Home */}
//       <Button
//         onClick={() => router.push("/feed")}
//         className="flex flex-col items-center gap-0"
//       >
//         <Home
//           size={24}
//           className={
//             pathname === "/feed"
//               ? "text-primary-300 size-5"
//               : "text-white size-5"
//           }
//         />
//         <p
//           className={`text-xs ${
//             pathname === "/feed" ? "text-primary-300" : "text-white"
//           }`}
//         >
//           Home
//         </p>
//       </Button>

//       {/* Add Post */}
//       <Button
//         onClick={() => router.push("/add-post")}
//         className="bg-primary-300 text-white rounded-full"
//       >
//         <Plus size={24} className="size-5" />
//       </Button>

//       {/* Profile */}
//       <Button
//         onClick={() => router.push("/profile")}
//         className="flex flex-col items-center gap-0"
//       >
//         <User
//           size={24}
//           className={
//             pathname === "/profile"
//               ? "text-primary-300 size-5"
//               : "text-white size-5"
//           }
//         />
//         <p
//           className={`text-xs ${
//             pathname === "/profile" ? "text-primary-300" : "text-white"
//           }`}
//         >
//           Profile
//         </p>
//       </Button>
//     </div>
//   );
// }
