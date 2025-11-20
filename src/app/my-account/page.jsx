"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateUser } from "@/lib/actions/updateUser";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner"; // Toast notifications

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Camera, Loader2 } from "lucide-react";

export default function EditProfile() {
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

  // 1. Load Auth
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  // 2. Load Data from Firestore
  useEffect(() => {
    if (!currentUser) return;

    async function load() {
      try {
        const ref = doc(db, "users", currentUser.uid);
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

    load();
  }, [currentUser]);

  // 3. Handle DP Selection
  function handleDpChange(e) {
    const file = e.target.files[0];
    if (file) {
      setDpFile(file);
      setDpPreview(URL.createObjectURL(file));
    }
  }

  // 4. Handle Input Changes
  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // 5. Save Changes
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
        toast.success("Profile updated successfully!");
        router.refresh(); // Refresh server components
        setTimeout(() => router.push("/my-account"), 800);
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="pt-24 max-w-2xl mx-auto text-white px-4 pb-20 animate-fadeIn">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Profile</h1>

      {/* DP Section */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 relative rounded-full overflow-hidden border-2 border-white/20">
            <Image
              src={dpPreview}
              alt="Profile Picture"
              fill
              className="object-cover"
              unoptimized // Needed if Firebase config isn't perfect yet
            />
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
          <Textarea 
            value={userData.bio} 
            onChange={(e) => handleChange("bio", e.target.value)} 
            rows={4} 
            className="bg-black/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">College</Label>
            <Input value={userData.college} onChange={(e) => handleChange("college", e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Branch</Label>
            <Input value={userData.branch} onChange={(e) => handleChange("branch", e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Year</Label>
            <Input value={userData.year} onChange={(e) => handleChange("year", e.target.value)} />
          </div>
          <div>
            <Label className="mb-2 block">Roll No</Label>
            <Input value={userData.rollNo} onChange={(e) => handleChange("rollNo", e.target.value)} />
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl space-y-4 border border-white/10">
          <h3 className="font-semibold text-lg text-gray-200">Privacy & Settings</h3>
          
          <div>
            <Label className="mb-2 block text-gray-400">Who can message you?</Label>
            <select
              className="w-full bg-black/40 border border-white/20 p-2.5 rounded-md text-white focus:ring-2 focus:ring-blue-600 outline-none"
              value={userData.allowMessagesFrom}
              onChange={(e) => handleChange("allowMessagesFrom", e.target.value)}
            >
              <option value="everyone">Everyone</option>
              <option value="linksOnly">Connections Only</option>
              <option value="noOne">No One</option>
            </select>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="onlineStatus"
              className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-600 bg-gray-700"
              checked={userData.showOnlineStatus}
              onChange={(e) => handleChange("showOnlineStatus", e.target.checked)}
            />
            <Label htmlFor="onlineStatus" className="cursor-pointer">Show Online Status</Label>
          </div>
        </div>

        <Button
          className="w-full h-12 text-lg font-semibold mt-6"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}