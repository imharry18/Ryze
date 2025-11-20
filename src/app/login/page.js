"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/loginSchema";

// Firebase
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// Next.js Router (must be inside component)
import { useRouter } from "next/navigation";

// ShadCN Components (Using Capitalized paths to match your file system)
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

// Icons
import { Loader2 } from "lucide-react";

// Google Icon (simple SVG)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.641-3.317-11.28-7.96l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C39.631,33.911,44,28.717,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

// Background shape
const BackgroundShape = ({ className }) => (
  <div className={`absolute rounded-full filter blur-[150px] opacity-20 ${className}`} />
);

export default function LoginPage() {
  const router = useRouter(); // MUST be inside component
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  // FIXED onSubmit (now inside the component)
  async function onSubmit(values) {
    try {
      setIsLoading(true);
      setMessage({ type: "", text: "" });

      await signInWithEmailAndPassword(auth, values.email, values.password);

      setMessage({ type: "success", text: "Login successful! Redirecting..." });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);

    } catch (error) {
      setMessage({ type: "error", text: "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center p-4">
      
      {/* Background */}
      <BackgroundShape className="bg-blue-600 w-96 h-96 top-1/4 left-1/4" />
      <BackgroundShape className="bg-blue-800 w-80 h-80 bottom-1/4 right-1/4" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-10 rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="RYZE Logo"
              width={12}
              height={32}
              className="h-8 w-auto filter brightness-0 invert"
            />
            <span className="text-2xl font-bold text-white">RYZE</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h1>

        {/* Social Login */}
        <Button
          variant="outline"
          className="w-full h-12 bg-white/90 text-black hover:bg-white flex items-center gap-3 text-base"
        >
          <GoogleIcon />
          Sign in with Google
        </Button>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-white/20 flex-1" />
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px bg-white/20 flex-1" />
        </div>

        {/* Form message */}
        {message.text && (
          <div className={`p-3 rounded-md text-center mb-4 text-sm ${
            message.type === "success"
              ? "bg-green-600/20 text-green-300 border border-green-600/30"
              : "bg-red-600/20 text-red-300 border border-red-600/30"
          }`}>
            {message.text}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="example@gmail.com"
            />
            <p className="text-red-400 text-sm mt-1">{errors.email?.message}</p>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter your password"
            />
            <p className="text-red-400 text-sm mt-1">{errors.password?.message}</p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-base"
          >
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