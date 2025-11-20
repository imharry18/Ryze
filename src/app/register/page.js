"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validations/registerSchema";
import { registerUser } from "@/lib/actions/registerUser";

// Next.js Router
import { useRouter } from "next/navigation";

// ShadCN Components
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "@/components/ui/Select";

// Data
import { colleges } from "@/data/Colleges.js";
import { branches } from "@/data/Branches.js";

// Icons
import { Loader2, ArrowLeft } from "lucide-react";

const BackgroundShape = ({ className }) => (
  <div className={`absolute rounded-full filter blur-[150px] opacity-20 ${className}`} />
);

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

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

  // -------------------------
  // 🔥 Handle Submit using registerUser.js
  // -------------------------
  async function onSubmit(values) {
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const result = await registerUser(values);

    if (!result.success) {
      const error = result.error;

      if (error.code === "auth/email-already-in-use") {
        setMessage({ type: "error", text: "This email is already registered." });
      } else if (error.code === "auth/invalid-email") {
        setMessage({ type: "error", text: "Invalid email address." });
      } else if (error.code === "auth/weak-password") {
        setMessage({ type: "error", text: "Password must be at least 6 characters." });
      } else {
        setMessage({ type: "error", text: "Something went wrong. Try again." });
      }

      setIsLoading(false);
      return;
    }

    // SUCCESS
    setMessage({ type: "success", text: "Account created! Redirecting..." });

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    setIsLoading(false);
  }

  // -------------------------
  // Step 1 → Step 2 Validation
  // -------------------------
  async function handleNextStep() {
    const isValid = await trigger(["name", "email", "password"]);
    if (isValid) setStep(2);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex items-center justify-center p-4">

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          {step === 1 ? "Create Your Account" : "College Details"}
        </h1>

        {/* Message */}
        {message.text && (
          <div className={`p-3 rounded-md text-center mb-4 text-sm ${
            message.type === "success"
              ? "bg-green-600/20 text-green-300 border border-green-600/30"
              : "bg-red-600/20 text-red-300 border border-red-600/30"
          }`}>
            {message.text}
          </div>
        )}

        {/* ----------------------- FORM ----------------------- */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* STEP 1 */}
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

              <Button onClick={handleNextStep} type="button" className="w-full mt-3 h-11">
                Next
              </Button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div>
                <Label>College</Label>
                <Select onValueChange={(v) => setValue("college", v)}>
                  <SelectTrigger><SelectValue placeholder="Select College" /></SelectTrigger>
                  <SelectContent>
                    {colleges.map((c, i) => (
                      <SelectItem key={i} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-red-400 text-sm mt-1">{errors.college?.message}</p>
              </div>

              <div>
                <Label>Year</Label>
                <Select onValueChange={(v) => setValue("year", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-red-400 text-sm mt-1">{errors.year?.message}</p>
              </div>

              <div>
                <Label>Branch</Label>
                <Select onValueChange={(v) => setValue("branch", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b, i) => (
                      <SelectItem key={i} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-red-400 text-sm mt-1">{errors.branch?.message}</p>
              </div>

              <div>
                <Label>Roll No</Label>
                <Input {...register("rollNo")} placeholder="Enter your roll number" />
                <p className="text-red-400 text-sm mt-1">{errors.rollNo?.message}</p>
              </div>

              <Button type="submit" className="w-full mt-3 h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </Button>
            </>
          )}
        </form>

        <p className="text-center text-gray-300 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}
