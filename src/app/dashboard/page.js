"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return window.location.href = "/login";
      }

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      setUserData(snap.data());
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="text-white text-center mt-20">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="text-white text-center mt-20 px-4">

      {/* Profile Section */}
      <div className="flex flex-col items-center">
        <Image
          src={userData.dp || "/default-dp.png"}
          width={100}
          height={100}
          alt="Profile"
          className="rounded-full object-cover border border-white/20"
        />
        
        <h1 className="text-3xl font-bold mt-4">
          Welcome, {userData.name}
        </h1>

        <p className="text-gray-400">@{userData.username || "username_not_set"}</p>

        {userData.bio && (
          <p className="text-gray-300 mt-2 max-w-md">
            {userData.bio}
          </p>
        )}
      </div>

      {/* College Details */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">College Information</h2>
        <p className="text-lg">College: {userData.college}</p>
        <p className="text-lg">Year: {userData.year}</p>
        <p className="text-lg">Branch: {userData.branch}</p>
        <p className="text-lg">Roll No: {userData.rollNo}</p>
      </div>

      {/* Social Stats */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Your Activity</h2>
        <p className="text-lg">Links: {userData.linksCount ?? 0}</p>
        <p className="text-lg">Joined Communities: {userData.joinedCommunities?.length || 0}</p>
        <p className="text-lg">Subscribed Communities: {userData.subscribedCommunities?.length || 0}</p>
        <p className="text-lg">Posts: {userData.posts}</p>
      </div>

      {/* Profile Completion Notice */}
      {!userData.isProfileComplete && (
        <p className="text-yellow-400 mt-10 text-lg">
          Your profile is incomplete — go to Edit Profile to finish it!
        </p>
      )}
    </div>
  );
}
