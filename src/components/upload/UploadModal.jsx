"use client";

import React, { useState } from "react";
import { X, Ghost, Megaphone } from "lucide-react";
import PostUploadForm from "./PostUploadForm";
import ReelUploadForm from "./ReelUploadForm";
import useUpload from "@/hooks/useUpload";
import { useAuth } from "@/hooks/useAuth"; // NextAuth Hook
import { Switch } from "@/components/ui/Switch";

const CONFESSION_CATEGORIES = ["Love", "Dare", "Challenge", "Secret", "Other"];
const NOTICE_CATEGORIES = ["Query", "Update", "Event", "Lost & Found", "Academic"];
const MAX_WORDS = 60;
const countWords = (str) => str.trim().split(/\s+/).length;

const ConfessionForm = ({ onClose }) => {
  const { user } = useAuth();
  const { upload, uploading } = useUpload();
  
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Secret");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const wordCount = countWords(text);
  const isOverLimit = wordCount > MAX_WORDS;

  const handleSubmit = async () => {
    if (!text.trim()) return alert("Please write something!");
    if (isOverLimit) return alert(`Please keep it under ${MAX_WORDS} words.`);
    if (!user) return alert("Login required");

    try {
        await upload({
            uid: user.id, // Using Postgres ID
            file: null,
            mediaType: "text",
            caption: text,
            location: "",
            postType: "confession",
            extraData: {
                category,
                isAnonymous
            }
        });
        onClose();
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500">
            <Ghost className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Share a Confession</h3>
      <p className="text-gray-400 text-sm mb-6">
        {isAnonymous ? "Your identity will be hidden." : "Posting as yourself."}
      </p>

      <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-center gap-2 flex-wrap">
            {CONFESSION_CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                        category === cat ? "bg-white text-black border-white" : "bg-transparent text-gray-400 border-white/20"
                    }`}
                >
                    {cat}
                </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 w-fit mx-auto">
             <span className="text-sm text-gray-300">Anonymous Mode</span>
             <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
      </div>

      <div className={`p-4 border rounded-xl bg-white/5 mb-2 transition ${isOverLimit ? "border-red-500/50" : "border-white/10"}`}>
        <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your confession here..." 
            className="w-full bg-transparent text-white focus:outline-none resize-none h-32 text-lg placeholder:text-gray-600" 
        />
      </div>
      <div className={`text-right text-xs mb-6 ${isOverLimit ? "text-red-400 font-bold" : "text-gray-500"}`}>
        {wordCount}/{MAX_WORDS} words
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={uploading || isOverLimit}
        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
      >
        {uploading ? "Posting..." : "Post Confession"}
      </button>
    </div>
  );
};

const NoticeForm = ({ onClose }) => {
  const { user } = useAuth();
  const { upload, uploading } = useUpload();
  
  const [title, setTitle] = useState(""); 
  const [details, setDetails] = useState(""); 
  const [category, setCategory] = useState("Update");

  const wordCount = countWords(details);
  const isOverLimit = wordCount > MAX_WORDS;

  const handleSubmit = async () => {
    if (!title.trim() || !details.trim()) return alert("Please fill all fields!");
    if (!user) return alert("Login required");

    try {
        await upload({
            uid: user.id, // Using Postgres ID
            file: null,
            mediaType: "text",
            caption: title, 
            location: "",
            postType: "notice",
            extraData: {
                details, 
                category,
                isAnonymous: false
            }
        });
        onClose();
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="p-6 md:p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500">
            <Megaphone className="w-8 h-8 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Post a Notice</h3>
      <p className="text-gray-400 text-sm mb-6">Broadcast important information.</p>

      <div className="flex justify-center gap-2 flex-wrap mb-6">
        {NOTICE_CATEGORIES.map(cat => (
            <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                    category === cat ? "bg-white text-black border-white" : "bg-transparent text-gray-400 border-white/20"
                }`}
            >
                {cat}
            </button>
        ))}
      </div>

      <div className="space-y-4 max-w-md mx-auto">
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notice Title" 
            className="w-full bg-[#18181b] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 font-bold" 
          />
          
          <div className="bg-[#18181b] border border-white/10 rounded-lg p-3">
            <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Details..." 
                className="w-full bg-transparent text-white focus:outline-none h-32 resize-none" 
            />
          </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={uploading || isOverLimit}
        className="mt-6 w-full bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-500 transition font-bold disabled:opacity-50"
      >
        {uploading ? "Publishing..." : "Publish Notice"}
      </button>
    </div>
  );
};

export default function UploadModal({ isOpen, onClose, uploadType }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl w-full max-w-2xl relative overflow-hidden shadow-2xl">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
            Create {uploadType}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-0 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {uploadType === "reel" && <ReelUploadForm onClose={onClose} />}
          {uploadType === "post" && <PostUploadForm onClose={onClose} />}
          {uploadType === "confession" && <ConfessionForm onClose={onClose} />}
          {uploadType === "notice" && <NoticeForm onClose={onClose} />}
        </div>

      </div>
    </div>
  );
}