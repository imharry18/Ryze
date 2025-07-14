"use client";

import { useState, useEffect } from "react";

export function useNotifications(userId) {
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (!userId) {
        setRequestCount(0);
        return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/notifications`);
        if (res.ok) {
          const data = await res.json();
          // Adjust this depending on how your local backend structures notifications
          const count = data.pendingFriendRequests ? data.pendingFriendRequests.length : 0;
          setRequestCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, [userId]);

  return { requestCount };
}