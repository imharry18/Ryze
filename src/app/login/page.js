"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/loginSchema";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // Use NextAuth
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BackgroundShape = ({ className }) => (
  <div className={`absolute rounded-full filter blur-[150px] opacity-20 ${className}`} />
);

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      // NextAuth SignIn
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        toast.error("Invalid credentials.");
      } else {
        toast.success("Welcome back!");
        router.refresh();
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center p-4">
      <BackgroundShape className="bg-blue-600 w-96 h-96 top-1/4 left-1/4" />
      <BackgroundShape className="bg-blue-800 w-80 h-80 bottom-1/4 right-1/4" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="RYZE Logo" width={12} height={32} className="h-8 w-auto filter brightness-0 invert" />
            <span className="text-2xl font-bold text-white">RYZE</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="example@gmail.com" />
            <p className="text-red-400 text-sm mt-1">{errors.email?.message}</p>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} placeholder="Enter your password" />
            <p className="text-red-400 text-sm mt-1">{errors.password?.message}</p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11 text-base">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
          </Button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-8">
          Don’t have an account?{" "}
          <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}