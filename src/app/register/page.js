"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations/registerSchema";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // Use NextAuth for login after register

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "@/components/ui/Select";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { colleges } from "@/data/Colleges.js";
import { branches } from "@/data/Branches.js";

const BackgroundShape = ({ className }) => (
  <div className={`absolute rounded-full filter blur-[150px] opacity-20 ${className}`} />
);

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      college: "",
      year: "",
      branch: "",
      rollNo: "",
    },
  });

  const { register, handleSubmit, setValue, trigger, formState: { errors } } = form;

  async function onSubmit(values) {
    setIsLoading(true);

    try {
      // 1. Call our new API Route
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created! Logging you in...");

      // 2. Auto-login with NextAuth
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        toast.error("Login failed. Please log in manually.");
        router.push("/login");
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNextStep() {
    const isValid = await trigger(["name", "email", "password"]);
    if (isValid) setStep(2);
  }

  // ... (The rest of your JSX remains exactly the same as your original file)
  // Just ensure the form calls `handleSubmit(onSubmit)` which it already does.
  
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center p-4">
      {/* Backgrounds */}
      <BackgroundShape className="bg-blue-600 w-96 h-96 top-1/4 left-1/4" />
      <BackgroundShape className="bg-blue-800 w-80 h-80 bottom-1/4 right-1/4" />
      <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent opacity-50" />

      <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl p-6 sm:p-10 rounded-2xl w-full max-w-lg shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="RYZE Logo" width={12} height={32} className="h-8 w-auto filter brightness-0 invert" />
            <span className="text-2xl font-bold text-white">RYZE</span>
          </Link>

          {step === 2 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          {step === 1 ? "Create Your Account" : "College Details"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {step === 1 && (
            <>
              <div>
                <Label>Name</Label>
                <Input {...register("name")} placeholder="Enter your full name" />
                <p className="text-red-400 text-sm mt-1">{errors.name?.message}</p>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" {...register("email")} placeholder="example@gmail.com" />
                <p className="text-red-400 text-sm mt-1">{errors.email?.message}</p>
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" {...register("password")} placeholder="Enter password" />
                <p className="text-red-400 text-sm mt-1">{errors.password?.message}</p>
              </div>
              <Button onClick={handleNextStep} type="button" className="w-full mt-3 h-11">Next</Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>College</Label>
                <Select onValueChange={(v) => setValue("college", v)}>
                  <SelectTrigger><SelectValue placeholder="Select College" /></SelectTrigger>
                  <SelectContent>
                    {colleges.map((c, i) => <SelectItem key={i} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-red-400 text-sm mt-1">{errors.college?.message}</p>
              </div>
              <div>
                <Label>Year</Label>
                <Select onValueChange={(v) => setValue("year", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>
                    {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-red-400 text-sm mt-1">{errors.year?.message}</p>
              </div>
              <div>
                <Label>Branch</Label>
                <Select onValueChange={(v) => setValue("branch", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b, i) => <SelectItem key={i} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-red-400 text-sm mt-1">{errors.branch?.message}</p>
              </div>
              <div>
                <Label>Roll No</Label>
                <Input {...register("rollNo")} placeholder="2201015" />
                <p className="text-red-400 text-sm mt-1">{errors.rollNo?.message}</p>
              </div>
              <Button type="submit" className="w-full mt-3 h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </Button>
            </>
          )}
        </form>

        <p className="text-center text-gray-300 text-sm mt-8">
          Already have an account? <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">Login</Link>
        </p>
      </div>
    </div>
  );
}