"use client";

import { useState } from "react";
import { storage, db, auth } from "@/lib/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { X, Loader2 } from "lucide-react";

export default function UploadModal({ isOpen, onClose }) {
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [postType, setPostType] = useState("simple");
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!media) return alert("Please select a media file!");

    setUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) return alert("You must be logged in!");

      // 1️⃣ Upload File to Firebase Storage
      const fileRef = ref(
        storage,
        `posts/${user.uid}/${Date.now()}_${media.name}`
      );

      const uploadTask = uploadBytesResumable(fileRef, media);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error(error);
          alert("Upload failed");
          setUploading(false);
        },
        async () => {
          // 2️⃣ Get the URL after upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // 3️⃣ Save Post in Firestore
          await addDoc(collection(db, "posts"), {
            userId: user.uid,
            caption,
            mediaURL: downloadURL,
            type: postType,
            createdAt: serverTimestamp(),
          });

          alert("Uploaded Successfully!");

          // Clear form
          setMedia(null);
          setPreview(null);
          setCaption("");
          setPostType("simple");
          setUploading(false);
          onClose(); // close modal
        }
      );
    } catch (err) {
      console.error(err);
      alert("Error uploading!");
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0c0c0f] p-6 rounded-xl w-full max-w-3xl border border-white/10 relative">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-white">Create Post</h2>

        <div className="flex gap-6">

          {/* Left – Media Preview */}
          <label className="flex flex-col items-center justify-center w-1/2 h-64 border border-white/10 rounded-lg bg-white/5 cursor-pointer">
            {!preview ? (
              <span className="text-gray-400">Click to upload</span>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            )}

            <input
              type="file"
              accept="image/*, video/*"
              className="hidden"
              onChange={handleMediaSelect}
            />
          </label>

          {/* Right – Form */}
          <div className="w-1/2 space-y-4">
            <div>
              <label className="text-gray-300 text-sm">Caption</label>
              <textarea
                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg text-white"
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full p-3 bg-black/30 border border-white/10 rounded-lg text-white"
              >
                <option value="simple">Simple Post</option>
                <option value="event">Event</option>
              </select>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
