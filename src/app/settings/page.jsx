"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { Loader2, Upload, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// UI Components
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "@/components/ui/Select";

import { colleges } from "@/data/Colleges";
import { branches } from "@/data/Branches";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      bio: "",
      college: "",
      year: "",
      branch: "",
    }
  });

  // 1. Fetch current data to pre-fill form
  useEffect(() => {
    if (user?.uid) {
      // We fetch fresh data from API to ensure we have the latest bio/details
      fetch(`/api/users/${user.uid}`)
        .then(res => res.json())
        .then(data => {
            setValue("name", data.name || "");
            setValue("bio", data.bio || "");
            setValue("college", data.college || "");
            setValue("year", data.year || "");
            setValue("branch", data.branch || "");
            setPreview(data.image || "/default-dp.png");
        })
        .catch(err => console.error(err));
    }
  }, [user, setValue]);

  // 2. Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("file", file); // Register file in form
      setPreview(URL.createObjectURL(file)); // Show local preview
    }
  };

  // 3. Submit Update
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("bio", data.bio);
      formData.append("college", data.college);
      formData.append("year", data.year);
      formData.append("branch", data.branch);
      
      if (data.file) {
        formData.append("file", data.file);
      }

      const res = await fetch("/api/users/update", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      toast.success("Profile updated successfully!");
      router.refresh(); // Refresh server components
      router.push(`/profile/${user.uid}`);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-2xl mx-auto p-6">
        
        <div className="flex items-center gap-4 mb-8">
            <Link href={`/profile/${user.uid}`} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 group">
                    <Image 
                        src={preview || "/default-dp.png"} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                    />
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <Upload size={24} className="text-white" />
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
                <p className="text-sm text-gray-400">Tap image to change</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
                <div>
                    <Label>Full Name</Label>
                    <Input {...register("name")} placeholder="Your Name" />
                </div>

                <div>
                    <Label>Bio</Label>
                    <Textarea 
                        {...register("bio")} 
                        placeholder="Tell us about yourself..." 
                        className="bg-[#121212] border-white/10 min-h-[100px]" 
                    />
                </div>

                <div>
                    <Label>College</Label>
                    <Select onValueChange={(v) => setValue("college", v)} value={watch("college")}>
                        <SelectTrigger><SelectValue placeholder="Select College" /></SelectTrigger>
                        <SelectContent>
                            {colleges.map((c, i) => <SelectItem key={i} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Year</Label>
                        <Select onValueChange={(v) => setValue("year", v)} value={watch("year")}>
                            <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                            <SelectContent>
                                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Branch</Label>
                        <Select onValueChange={(v) => setValue("branch", v)} value={watch("branch")}>
                            <SelectTrigger><SelectValue placeholder="Branch" /></SelectTrigger>
                            <SelectContent>
                                {branches.map((b, i) => <SelectItem key={i} value={b}>{b}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={submitting} 
                className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-500"
            >
                {submitting ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Save Changes</>}
            </Button>

        </form>
      </div>
    </div>
  );
}