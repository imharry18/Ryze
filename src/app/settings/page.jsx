"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { 
  updatePassword, 
  sendPasswordResetEmail, 
  deleteUser, 
  signOut 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  LogOut,
  Trash2,
  ChevronRight,
  Loader2
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account"); // account | privacy | notifications | display

  // Form States
  const [passwordData, setPasswordData] = useState({ new: "", confirm: "" });
  const [userSettings, setUserSettings] = useState({});

  // 1. Load User & Settings
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Fetch Settings from Firestore
      try {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserSettings(snap.data());
        }
      } catch (err) {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // 2. Handle Setting Toggles (Auto-Save)
  const toggleSetting = async (category, field) => {
    // Optimistic UI update
    const newValue = category 
      ? !userSettings[category]?.[field] 
      : !userSettings[field];

    setUserSettings((prev) => {
      if (category) {
        return { ...prev, [category]: { ...prev[category], [field]: newValue } };
      }
      return { ...prev, [field]: newValue };
    });

    try {
      const ref = doc(db, "users", user.uid);
      const updateData = category 
        ? { [`${category}.${field}`]: newValue }
        : { [field]: newValue };
      
      await updateDoc(ref, updateData);
      toast.success("Setting updated");
    } catch (err) {
      toast.error("Failed to save setting");
      // Revert on error (optional: reload data)
    }
  };

  // 3. Password Update Handler
  const handleUpdatePassword = async () => {
    if (passwordData.new.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (passwordData.new !== passwordData.confirm) {
      return toast.error("Passwords do not match");
    }

    const loadingToast = toast.loading("Updating password...");
    try {
      await updatePassword(user, passwordData.new);
      toast.dismiss(loadingToast);
      toast.success("Password updated successfully!");
      setPasswordData({ new: "", confirm: "" });
    } catch (err) {
      toast.dismiss(loadingToast);
      if (err.code === 'auth/requires-recent-login') {
        toast.error("Please re-login to change password for security.");
        // Optional: logout user here
      } else {
        toast.error(err.message);
      }
    }
  };

  // 4. Reset Password Email
  const handleResetEmail = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success(`Reset link sent to ${user.email}`);
    } catch (err) {
      toast.error("Failed to send reset email");
    }
  };

  if (loading) return <div className="mt-40 text-center text-white">Loading settings...</div>;

  // --- Components for Tabs ---

  const SidebarItem = ({ id, label, icon: Icon, danger = false }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      } ${danger ? "text-red-400 hover:bg-red-900/10 hover:text-red-300" : ""}`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
      {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="pt-28 pb-20 max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
      
      {/* Left Sidebar */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <h1 className="text-2xl font-bold text-white mb-6 px-2">Settings</h1>
        
        <SidebarItem id="account" label="Account" icon={User} />
        <SidebarItem id="privacy" label="Privacy & Safety" icon={Shield} />
        <SidebarItem id="notifications" label="Notifications" icon={Bell} />
        <SidebarItem id="display" label="Display" icon={Palette} />
        
        <div className="h-px bg-white/10 my-4 mx-2" />
        
        <SidebarItem id="security" label="Login & Security" icon={Lock} />
        
        <button
          onClick={() => { signOut(auth); router.push("/login"); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/10 rounded-xl transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 bg-[#0c0c0f] border border-white/10 rounded-2xl p-6 md:p-8 min-h-[600px]">
        
        {/* --- ACCOUNT TAB --- */}
        {activeTab === "account" && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Account Information</h2>
              <p className="text-gray-400 text-sm">Manage your account details.</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <Label>Email Address</Label>
                <Input disabled value={user.email} className="bg-white/5 border-transparent opacity-60" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed manually.</p>
              </div>
              
              <div>
                <Label>Username</Label>
                <Input disabled value={`@${userSettings.username}`} className="bg-white/5 border-transparent opacity-60" />
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
               <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                 <Trash2 size={18} /> Danger Zone
               </h3>
               <p className="text-gray-400 text-sm mb-4">
                 Deleting your account is permanent. All your data, posts, and connections will be wiped.
               </p>
               <Button variant="destructive" onClick={() => alert("Please contact support to delete account (Safety Feature).")}>
                 Delete Account
               </Button>
            </div>
          </div>
        )}

        {/* --- SECURITY TAB (Password) --- */}
        {activeTab === "security" && (
           <div className="space-y-8 animate-fadeIn">
             <div>
               <h2 className="text-xl font-bold text-white mb-1">Login & Security</h2>
               <p className="text-gray-400 text-sm">Update password and secure your account.</p>
             </div>

             <div className="bg-white/5 p-6 rounded-xl border border-white/10 max-w-lg">
               <h3 className="font-semibold text-white mb-4">Change Password</h3>
               
               <div className="space-y-4">
                 <div>
                   <Label>New Password</Label>
                   <Input 
                     type="password" 
                     value={passwordData.new}
                     onChange={(e) => setPasswordData(prev => ({...prev, new: e.target.value}))}
                     placeholder="••••••••"
                   />
                 </div>
                 <div>
                   <Label>Confirm Password</Label>
                   <Input 
                     type="password" 
                     value={passwordData.confirm}
                     onChange={(e) => setPasswordData(prev => ({...prev, confirm: e.target.value}))}
                     placeholder="••••••••"
                   />
                 </div>
                 
                 <div className="flex gap-3 pt-2">
                   <Button onClick={handleUpdatePassword}>Update Password</Button>
                   <Button variant="outline" onClick={handleResetEmail}>Send Reset Link instead</Button>
                 </div>
               </div>
             </div>
           </div>
        )}

        {/* --- PRIVACY TAB --- */}
        {activeTab === "privacy" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Privacy</h2>
              <p className="text-gray-400 text-sm">Control who can see you and message you.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
              {/* Item */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-white font-medium">Online Status</h4>
                  <p className="text-gray-400 text-sm">Let others see when you are active.</p>
                </div>
                <Switch 
                  checked={userSettings.showOnlineStatus} 
                  onCheckedChange={() => toggleSetting(null, "showOnlineStatus")} 
                />
              </div>

              {/* Item */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-white font-medium">Read Receipts</h4>
                  <p className="text-gray-400 text-sm">Show when you've read a message.</p>
                </div>
                <Switch 
                  checked={userSettings.readReceipts} 
                  onCheckedChange={() => toggleSetting(null, "readReceipts")} 
                />
              </div>

              {/* Item */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-white font-medium">Search Visibility</h4>
                  <p className="text-gray-400 text-sm">Allow people to find you by your name or roll number.</p>
                </div>
                <Switch defaultChecked disabled /> 
              </div>
            </div>
          </div>
        )}

        {/* --- NOTIFICATIONS TAB --- */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Notifications</h2>
              <p className="text-gray-400 text-sm">Choose what you want to be notified about.</p>
            </div>

            <div className="space-y-1 max-w-2xl">
              {/* Helper function for notification items */}
              {[
                { id: "messages", label: "Direct Messages", desc: "New messages from your connections" },
                { id: "mentions", label: "Mentions & Tags", desc: "When someone tags you in a post or comment" },
                { id: "posts", label: "Community Posts", desc: "Trending posts from your communities" },
                { id: "links", label: "Connection Requests", desc: "When someone wants to connect with you" },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">
                  <div>
                    <h4 className="text-white font-medium">{item.label}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={userSettings.notifications?.[item.id]} 
                    onCheckedChange={() => toggleSetting("notifications", item.id)} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

         {/* --- DISPLAY TAB --- */}
         {activeTab === "display" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Display & Accessibility</h2>
              <p className="text-gray-400 text-sm">Manage your theme preferences.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-lg">
               {['system', 'dark', 'light'].map((theme) => (
                 <button
                   key={theme}
                   onClick={() => toggleSetting(null, "theme")} // Ideally this needs logic to set specific value
                   className={`p-4 rounded-xl border text-center capitalize transition-all ${
                     userSettings.theme === theme 
                      ? "bg-blue-600/20 border-blue-500 text-white" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                   }`}
                 >
                   {theme}
                 </button>
               ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">*Currently locked to Dark Mode by Ryze System Default.</p>
          </div>
        )}

      </div>
    </div>
  );
}