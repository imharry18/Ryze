"use client";

import { useState, useEffect } from "react";
import { addComment, listenComments } from "@/lib/comments";
import { useAuth } from "@/hooks/useAuth";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const unsub = listenComments(postId, setComments);
    return () => unsub();
  }, [postId]);

  const sendComment = async () => {
    await addComment(postId, user.uid, input);
    setInput("");
  };

  return (
    <div className="mt-4">
      <div className="max-h-60 overflow-y-auto space-y-3">
        {comments.map(c => (
          <div key={c.id} className="flex items-start gap-3 text-white/80">
            <div className="h-8 w-8 bg-white/10 rounded-full" />
            <div>
              <p className="text-sm">{c.text}</p>
              <span className="text-xs text-white/40">{c.createdAt?.toDate?.().toLocaleString?.()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg outline-none"
        />
        <button
          onClick={sendComment}
          className="bg-blue-600 text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
