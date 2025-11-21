// src/components/upload/PostUploadForm.jsx
"use client";
import React, { useRef, useState, useEffect } from "react";
import useUpload from "@/hooks/useUpload";
import MediaPreview from "./MediaPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input"; // Import Input component
import { useAuth } from "@/hooks/useAuth";
import { MapPin } from "lucide-react";

export default function PostUploadForm({ onClose }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(""); 
  
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState(""); // New State
  const [postType, setPostType] = useState("post");

  const { upload, progress, uploading, error, reset } = useUpload();

  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }
    };
  }, [previewURL]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
        setFile(null);
        setPreviewURL("");
        return;
    }
    if (!f.type.startsWith("image/")) {
      alert("Please pick an image.");
      return;
    }
    const url = URL.createObjectURL(f);
    setFile(f);
    setPreviewURL(url);
  };

  const startUpload = async () => {
    if (!user) return alert("Login required");
    if (!file) return alert("Select an image");
    
    try {
      // Pass location here
      await upload({ uid: user.uid, file, mediaType: "image", caption, location, postType });
      reset();
      onClose?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 min-h-[400px]">
      {/* Left: Media */}
      <div className="w-full md:w-1/2 bg-black/60 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
        {previewURL ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
             <MediaPreview previewURL={previewURL} fileType={file?.type} />
             <button 
               onClick={() => { 
                 setFile(null); 
                 setPreviewURL(""); 
                 fileRef.current.value = ""; 
               }}
               className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
             >
                ✕
             </button>
          </div>
        ) : (
          <div className="text-center text-gray-400 p-6">
            <p className="mb-3 text-lg font-medium text-white">Select Photo</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
          </div>
        )}
      </div>

      {/* Right: Details */}
      <div className="w-full md:w-1/2 flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-4">New Post</h3>
        
        <div className="space-y-4 flex-1">
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Caption</label>
                <textarea 
                    value={caption} 
                    onChange={(e)=>setCaption(e.target.value)} 
                    placeholder="Write a caption..." 
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg h-24 resize-none focus:outline-none focus:border-blue-500 text-white transition" 
                />
            </div>

            {/* Location Input */}
            <div>
                <label className="text-sm text-gray-400 mb-1 block">Add Location</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <Input 
                        value={location} 
                        onChange={(e)=>setLocation(e.target.value)} 
                        placeholder="Nagpur, India" 
                        className="pl-9 bg-white/5 border-white/10" 
                    />
                </div>
            </div>
            
            <div>
                <label className="text-sm text-gray-400 mb-2 block">Post type</label>
                <div className="flex gap-3">
                    <button 
                        className={`flex-1 py-2 rounded-lg border transition ${postType==="post" ? "bg-blue-600 border-blue-600 text-white" : "border-white/20 text-gray-400 hover:border-white/40"}`} 
                        onClick={()=>setPostType("post")}
                    >
                        Standard Post
                    </button>
                    <button 
                        className={`flex-1 py-2 rounded-lg border transition ${postType==="event" ? "bg-purple-600 border-purple-600 text-white" : "border-white/20 text-gray-400 hover:border-white/40"}`} 
                        onClick={()=>setPostType("event")}
                    >
                        Event
                    </button>
                </div>
            </div>
        </div>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mt-4">
                {error}
            </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10">
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-blue-400 mb-1">
                 <span>{progress === 0 ? "Preparing..." : "Uploading..."}</span>
                 <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out" 
                    style={{width: `${Math.max(5, progress)}%`}} 
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onClose} disabled={uploading}>Cancel</Button>
            <Button onClick={startUpload} disabled={uploading || !file} className="min-w-[100px]">
                {uploading ? "Processing..." : "Share"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}