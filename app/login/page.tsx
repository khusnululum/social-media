"use client";

import Image from "next/image";
import Logo from "@/assets/svg/logo.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "@/schemas/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Gradient from "@/assets/png/gradient.png";
import Gradient2 from "@/assets/png/gradient2.png";

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      router.push("/feed");
    },
  });

  const onSubmit = (data: LoginSchema) => {
    mutation.mutate(data);
  };
  return (
    <div className="relative bg-black flex min-h-screen items-center justify-center">
      {/* Gradient Backgroud */}
      <Image src={Gradient} alt="Gradient" className="absolute bottom-0" />
      <Image src={Gradient2} alt="Gradient" className="absolute bottom-0" />

      <Card className="bg-black text-white border-neutral-900 w-86 p-8">
        {/* Header  */}
        <div className="flex gap-3 justify-center">
          <Image src={Logo} alt="Logo" width={30} />
          <h1 className="text-xl font-bold">Sociality</h1>
        </div>
        <h2 className="text-lg font-semibold text-center">Welcome back!</h2>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              {...form.register("email")}
              className="bg-neutral-950 border-neutral-900"
            />
          </div>

          <div className="space-y-2 mb-6">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              {...form.register("password")}
              className="bg-neutral-950 border-neutral-900"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-300 rounded-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Loading..." : "Login"}
          </Button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-zinc-400">
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-purple-400 cursor-pointer"
          >
            Register
          </span>
        </p>
      </Card>
    </div>
  );
}
