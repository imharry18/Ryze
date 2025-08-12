"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { User, Lock, Bell, Shield, Palette, LogOut, Trash2, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account");

  const [passwordData, setPasswordData] = useState({ new: "", confirm: "" });
  const [userSettings, setUserSettings] = useState({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      const fetchSettings = async () => {
        try {
          const res = await fetch(`/api/users/${user.uid}/settings`);
          if (res.ok) {
            const data = await res.json();
            setUserSettings(data);
          }
        } catch (err) {
          toast.error("Failed to load settings.");
        } finally {
          setLoading(false);
        }
      };

      fetchSettings();
    }
  }, [user, authLoading, router]);

  const toggleSetting = async (category, field) => {
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
      const updateData = category ? { [`${category}.${field}`]: newValue } : { [field]: newValue };
      await fetch(`/api/users/${user.uid}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      toast.success("Setting updated");
    } catch (err) {
      toast.error("Failed to save setting");
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new.length < 6) return toast.error("Password must be at least 6 characters");
    if (passwordData.new !== passwordData.confirm) return toast.error("Passwords do not match");

    const loadingToast = toast.loading("Updating password...");
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, newPassword: passwordData.new })
      });
      
      if (!res.ok) throw new Error("Failed to update password");

      toast.dismiss(loadingToast);
      toast.success("Password updated successfully!");
      setPasswordData({ new: "", confirm: "" });
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message);
    }
  };

  const handleResetEmail = async () => {
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      toast.success(`Reset link sent to ${user.email}`);
    } catch (err) {
      toast.error("Failed to send reset email");
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading || authLoading) return <div className="mt-40 text-center text-white">Loading settings...</div>;

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
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <h1 className="text-2xl font-bold text-white mb-6 px-2">Settings</h1>
        
        <SidebarItem id="account" label="Account" icon={User} />
        <SidebarItem id="privacy" label="Privacy & Safety" icon={Shield} />
        <SidebarItem id="notifications" label="Notifications" icon={Bell} />
        <SidebarItem id="display" label="Display" icon={Palette} />
        
        <div className="h-px bg-white/10 my-4 mx-2" />
        
        <SidebarItem id="security" label="Login & Security" icon={Lock} />
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/10 rounded-xl transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="flex-1 bg-[#0c0c0f] border border-white/10 rounded-2xl p-6 md:p-8 min-h-[600px]">
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
                <Input disabled value={`@${userSettings.username || user.name}`} className="bg-white/5 border-transparent opacity-60" />
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
                   <Input type="password" value={passwordData.new} onChange={(e) => setPasswordData(prev => ({...prev, new: e.target.value}))} placeholder="••••••••" />
                 </div>
                 <div>
                   <Label>Confirm Password</Label>
                   <Input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData(prev => ({...prev, confirm: e.target.value}))} placeholder="••••••••" />
                 </div>
                 
                 <div className="flex gap-3 pt-2">
                   <Button onClick={handleUpdatePassword}>Update Password</Button>
                   <Button variant="outline" onClick={handleResetEmail}>Send Reset Link</Button>
                 </div>
               </div>
             </div>
           </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Privacy</h2>
              <p className="text-gray-400 text-sm">Control who can see you and message you.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-white font-medium">Online Status</h4>
                  <p className="text-gray-400 text-sm">Let others see when you are active.</p>
                </div>
                <Switch checked={userSettings.showOnlineStatus} onCheckedChange={() => toggleSetting(null, "showOnlineStatus")} />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-white font-medium">Read Receipts</h4>
                  <p className="text-gray-400 text-sm">Show when you've read a message.</p>
                </div>
                <Switch checked={userSettings.readReceipts} onCheckedChange={() => toggleSetting(null, "readReceipts")} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Notifications</h2>
              <p className="text-gray-400 text-sm">Choose what you want to be notified about.</p>
            </div>

            <div className="space-y-1 max-w-2xl">
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
                  <Switch checked={userSettings.notifications?.[item.id]} onCheckedChange={() => toggleSetting("notifications", item.id)} />
                </div>
              ))}
            </div>
          </div>
        )}

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
                   onClick={() => toggleSetting(null, "theme")} 
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
            <p className="text-gray-500 text-xs mt-2">*Currently locked to Dark Mode by SpectraY System Default.</p>
          </div>
        )}
      </div>
    </div>
  );
}