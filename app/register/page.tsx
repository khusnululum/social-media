"use client";

import Image from "next/image";
import Logo from "@/assets/svg/logo.svg";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import Gradient from "@/assets/png/gradient.png";
import Gradient2 from "@/assets/png/gradient2.png";

export default function RegisterPage() {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      router.push("/login");
    },
  });

  const onSubmit = (data: RegisterSchema) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-black relative min-h-screen flex items-center justify-center">
      {/* Gradient Backgroud */}
      <Image
        src={Gradient}
        alt="Gradient"
        className="absolute bottom-0 w-full z-0"
      />
      <Image
        src={Gradient2}
        alt="Gradient"
        className="absolute bottom-0 w-full z-0"
      />
      <Card className="bg-black text-white border-neutral-900 w-86 px-4 py-6 z-1">
        <div className="flex gap-3 justify-center mt-6">
          <Image src={Logo} alt="Logo" width={30} />
          <h1 className="text-xl font-bold">Sociality</h1>
        </div>
        <h2 className="text-lg font-semibold text-center">Register</h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              placeholder="Enter your email"
              {...form.register("email")}
              className="bg-neutral-950 border-neutral-900"
            />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              placeholder="Enter your username"
              {...form.register("username")}
              className="bg-neutral-950 border-neutral-900"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              placeholder="Enter your phone number"
              {...form.register("phoneNumber")}
              className="bg-neutral-950 border-neutral-900"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              placeholder="Enter your password"
              {...form.register("password")}
              className="bg-neutral-950 border-neutral-900"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              placeholder="Enter your confirm password"
              {...form.register("confirmPassword")}
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

        {/* Login link */}
        <p className="text-center text-sm text-white">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-primary-200 cursor-pointer"
          >
            Login
          </span>
        </p>
      </Card>
    </div>
  );
}
