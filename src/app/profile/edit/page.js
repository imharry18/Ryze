"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateUser } from "@/lib/actions/updateUser";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    bio: "",
    college: "",
    year: "",
    branch: "",
    rollNo: "",
    allowMessagesFrom: "everyone",
    showOnlineStatus: true,
    theme: "system",
    dp: "/default-dp.png",
  });

  const [dpFile, setDpFile] = useState(null);
  const [dpPreview, setDpPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchData(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  async function fetchData(uid) {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUserData((prev) => ({ ...prev, ...data }));
        setDpPreview(data.dp || "/default-dp.png");
      }
    } catch (error) {
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }

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
    if (!userData.name || !userData.username) {
      toast.error("Name and Username are required.");
      return;
    }

    setSaving(true);
    toast.loading("Updating profile...");

    try {
      const res = await updateUser(currentUser.uid, userData, dpFile);
      if (res.success) {
        toast.dismiss();
        toast.success("Profile updated!");
        router.refresh();
        // Redirect back to the unified profile page
        router.push(`/profile/${currentUser.uid}`); 
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="pt-24 max-w-2xl mx-auto text-white px-4 pb-20 animate-fadeIn">
      
      <Link href={`/profile/${currentUser?.uid}`} className="flex items-center text-gray-400 hover:text-white mb-6 transition">
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

        {/* College Info (Read Only or Editable depending on your policy) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">College</Label>
            <Input value={userData.college} disabled className="opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <Label className="mb-2 block">Branch</Label>
            <Input value={userData.branch} onChange={(e) => handleChange("branch", e.target.value)} />
          </div>
        </div>

        <Button className="w-full h-12 text-lg font-bold mt-6" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}