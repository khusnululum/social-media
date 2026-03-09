"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Logo from "@/assets/svg/logo.svg";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
      {/* Glow Background */}
      <div className="absolute w-75 h-75 bg-primary-300 opacity-20 blur-[120px] rounded-full"></div>

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-primary-300 flex items-center justify-center text-3xl">
          <Image alt="Logo" src={Logo} />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold">Sociality</h1>
          <p className="text-neutral-400 mt-1">Let's make you day</p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-purple-500 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
