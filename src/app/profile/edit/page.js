"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/lib/actions/updateUser"; // New Server Action

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    bio: "",
    branch: "",
  });
  const [dpFile, setDpFile] = useState(null);
  const [dpPreview, setDpPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
        setUserData({
            name: user.name || "",
            username: user.username || "",
            bio: user.bio || "",
            branch: user.branch || "",
        });
        setDpPreview(user.image || "/default-dp.png");
    }
  }, [user]);

  function handleDpChange(e) {
    const file = e.target.files[0];
    if (file) {
      setDpFile(file);
      setDpPreview(URL.createObjectURL(file));
    }
  }

  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("username", userData.username);
      formData.append("bio", userData.bio);
      formData.append("branch", userData.branch);
      if (dpFile) formData.append("file", dpFile);

      const res = await updateUser(user.id, formData);
      
      if (res.success) {
        toast.success("Profile updated!");
        // Force refresh to update session data if possible, or redirect
        window.location.href = `/profile/${user.id}`;
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="pt-24 max-w-2xl mx-auto text-white px-4 pb-20 animate-fadeIn">
      
      <Link href={`/profile/${user.id}`} className="flex items-center text-gray-400 hover:text-white mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Profile
      </Link>

      <h1 className="text-3xl font-bold text-center mb-8">Edit Profile</h1>

      {/* DP Section */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 relative rounded-full overflow-hidden border-2 border-white/20 bg-gray-800">
            <Image src={dpPreview} alt="DP" fill className="object-cover" unoptimized />
          </div>
          <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition shadow-lg">
            <Camera size={18} className="text-white" />
            <input type="file" className="hidden" accept="image/*" onChange={handleDpChange} />
          </label>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Name</Label>
            <Input value={userData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Username</Label>
            <Input value={userData.username} onChange={(e) => handleChange("username", e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Bio</Label>
          <Textarea value={userData.bio} onChange={(e) => handleChange("bio", e.target.value)} rows={4} className="bg-black/20" />
        </div>

        <div>
            <Label className="mb-2 block">Branch</Label>
            <Input value={userData.branch} onChange={(e) => handleChange("branch", e.target.value)} />
        </div>

        <Button className="w-full h-12 text-lg font-bold mt-6" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}