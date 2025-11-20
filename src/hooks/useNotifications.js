"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useNotifications(userId) {
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (!userId) {
        setRequestCount(0);
        return;
    }

    const userRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Count the number of pending friend requests
        const count = data.pendingFriendRequests ? data.pendingFriendRequests.length : 0;
        setRequestCount(count);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return { requestCount };
}