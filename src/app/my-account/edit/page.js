"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { updateUser } from "@/lib/actions/updateUser";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Camera } from "lucide-react";

export default function EditProfile() {
  // -------------------------------
  // ALL HOOKS MUST BE AT THE TOP
  // -------------------------------
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [dpFile, setDpFile] = useState(null);
  const [dpPreview, setDpPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --------------------------------
  // Load auth user on CLIENT only
  // --------------------------------
  useEffect(() => {
    setCurrentUser(auth.currentUser);
  }, []);

  // --------------------------------
  // Load Firestore user
  // --------------------------------
  useEffect(() => {
    if (!currentUser) return;

    async function load() {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      const data = snap.data();

      if (!data) {
        alert("User data not found in Firestore.");
        setLoading(false);
        return;
      }

      const safe = {
        name: data.name || "",
        username: data.username || "",
        bio: data.bio || "",
        college: data.college || "",
        year: data.year || "",
        branch: data.branch || "",
        rollNo: data.rollNo || "",
        allowMessagesFrom: data.allowMessagesFrom || "everyone",
        showOnlineStatus: data.showOnlineStatus ?? true,
        theme: data.theme || "system",
        dp: data.dp || "/default-dp.png",
      };

      setUserData(safe);
      setDpPreview(safe.dp);
      setLoading(false);
    }

    load();
  }, [currentUser]);

  // --------------------------------
  // DP change
  // --------------------------------
  function handleDpChange(e) {
    const file = e.target.files[0];
    setDpFile(file);
    setDpPreview(URL.createObjectURL(file));
  }

  // --------------------------------
  // SAVE PROFILE
  // --------------------------------
  async function handleSave() {
    setSaving(true);

    const updated = {
      name: userData.name,
      username: userData.username,
      bio: userData.bio,
      college: userData.college,
      year: userData.year,
      branch: userData.branch,
      rollNo: userData.rollNo,
      allowMessagesFrom: userData.allowMessagesFrom,
      showOnlineStatus: userData.showOnlineStatus,
      theme: userData.theme,
    };

    const res = await updateUser(currentUser.uid, updated, dpFile);

    if (res.success) router.push("/my-account");
    else alert("Failed to update.");

    setSaving(false);
  }

  // --------------------------------
  // SAFE LOADING STATE
  // --------------------------------
  if (!currentUser || loading || !userData) {
    return (
      <div className="text-white mt-40 text-center">
        Loading profile...
      </div>
    );
  }

  // --------------------------------
  // UI STARTS HERE
  // --------------------------------
  return (
    <div className="pt-24 max-w-2xl mx-auto text-white px-4 pb-20">
      <h1 className="text-3xl font-bold text-center mb-6">Edit Profile</h1>

      {/* DP */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={dpPreview}
            onError={(e) => (e.target.src = "/default-dp.png")}
            className="w-32 h-32 rounded-full object-cover border border-white/20"
          />

          <label className="absolute bottom-1 right-1 bg-black/80 p-2 rounded-full cursor-pointer">
            <Camera size={18} />
            <input type="file" className="hidden" onChange={handleDpChange} />
          </label>
        </div>
      </div>

      {/* NAME */}
      <div className="mt-6">
        <Label>Name</Label>
        <Input
          value={userData.name}
          onChange={(e) =>
            setUserData({ ...userData, name: e.target.value })
          }
        />
      </div>

      {/* USERNAME */}
      <div className="mt-6">
        <Label>Username</Label>
        <Input
          value={userData.username}
          onChange={(e) =>
            setUserData({ ...userData, username: e.target.value })
          }
        />
      </div>

      {/* BIO */}
      <div className="mt-6">
        <Label>Bio</Label>
        <Textarea
          value={userData.bio}
          onChange={(e) =>
            setUserData({ ...userData, bio: e.target.value })
          }
          rows={4}
        />
      </div>

      {/* COLLEGE */}
      <div className="mt-6">
        <Label>College</Label>
        <Input
          value={userData.college}
          onChange={(e) =>
            setUserData({ ...userData, college: e.target.value })
          }
        />
      </div>

      {/* YEAR */}
      <div className="mt-6">
        <Label>Year</Label>
        <Input
          value={userData.year}
          onChange={(e) =>
            setUserData({ ...userData, year: e.target.value })
          }
        />
      </div>

      {/* BRANCH */}
      <div className="mt-6">
        <Label>Branch</Label>
        <Input
          value={userData.branch}
          onChange={(e) =>
            setUserData({ ...userData, branch: e.target.value })
          }
        />
      </div>

      {/* ROLL */}
      <div className="mt-6">
        <Label>Roll No</Label>
        <Input
          value={userData.rollNo}
          onChange={(e) =>
            setUserData({ ...userData, rollNo: e.target.value })
          }
        />
      </div>

      {/* MESSAGES */}
      <div className="mt-6">
        <Label>Who can message you?</Label>
        <select
          className="w-full bg-black/40 border border-white/20 p-3 rounded-lg mt-2"
          value={userData.allowMessagesFrom}
          onChange={(e) =>
            setUserData({
              ...userData,
              allowMessagesFrom: e.target.value,
            })
          }
        >
          <option value="everyone">Everyone</option>
          <option value="linksOnly">Connections Only</option>
          <option value="noOne">No One</option>
        </select>
      </div>

      {/* ONLINE STATUS */}
      <div className="mt-6 flex items-center gap-3">
        <input
          type="checkbox"
          checked={userData.showOnlineStatus}
          onChange={(e) =>
            setUserData({
              ...userData,
              showOnlineStatus: e.target.checked,
            })
          }
        />
        <Label>Show Online Status</Label>
      </div>

      {/* THEME */}
      <div className="mt-6">
        <Label>Theme</Label>
        <select
          className="w-full bg-black/40 border border-white/20 p-3 rounded-lg mt-2"
          value={userData.theme}
          onChange={(e) =>
            setUserData({ ...userData, theme: e.target.value })
          }
        >
          <option value="system">System Default</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      {/* SAVE BUTTON */}
      <Button
        className="w-full mt-10 h-12"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
