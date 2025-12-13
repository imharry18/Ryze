"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Uses NextAuth now
import { signOut } from "next-auth/react"; 
import { updateSettings } from "@/lib/actions/settings"; // Import Server Action
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
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  // Form States
  const [passwordData, setPasswordData] = useState({ new: "", confirm: "" });
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    readReceipts: true,
    notifications: { messages: true, posts: true }
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const toggleSetting = (category, field) => {
    // Optimistic UI update (Implementation of persistence depends on schema)
    if (category) {
        setSettings(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: !prev[category][field] }
        }));
    } else {
        setSettings(prev => ({ ...prev, [field]: !prev[field] }));
    }
    toast.success("Setting updated (Session only)");
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      return toast.error("Passwords do not match");
    }

    const loadingToast = toast.loading("Updating password...");
    
    try {
      const res = await updateSettings(user.id, { 
        type: "password", 
        newPassword: passwordData.new 
      });

      if (res.success) {
        toast.dismiss(loadingToast);
        toast.success("Password updated successfully!");
        setPasswordData({ new: "", confirm: "" });
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to update password");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

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
          onClick={handleLogout}
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
                <Input disabled value={user.email || ""} className="bg-white/5 border-transparent opacity-60" />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
              </div>
              
              <div>
                <Label>Username</Label>
                <Input disabled value={`@${user.username || "user"}`} className="bg-white/5 border-transparent opacity-60" />
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
               <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                 <Trash2 size={18} /> Danger Zone
               </h3>
               <Button variant="destructive" onClick={() => alert("Please contact support to delete account.")}>
                 Delete Account
               </Button>
            </div>
          </div>
        )}

        {/* --- SECURITY TAB --- */}
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
              <p className="text-gray-400 text-sm">Control visibility.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <h4 className="text-white font-medium">Online Status</h4>
                  <p className="text-gray-400 text-sm">Show when you are active.</p>
                </div>
                <Switch 
                  checked={settings.showOnlineStatus} 
                  onCheckedChange={() => toggleSetting(null, "showOnlineStatus")} 
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}