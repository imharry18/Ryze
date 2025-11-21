"use client";

import React from "react";
import Image from "next/image";

export default function ProfileHeader({ profileUser, children }) {
  if (!profileUser) return null;

  return (
    <div className="w-full p-6 pt-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* 1. Profile Image (Square with Radius) */}
        <div className="relative h-36 w-36 shrink-0 rounded-3xl overflow-hidden border-2 border-white/10 bg-[#1a1a1a] shadow-xl">
          <Image
            src={profileUser.dp || "/default-dp.png"}
            alt={profileUser.name}
            fill
            className="object-cover"
          />
        </div>

        {/* 2. Info & Actions Section */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            
            {/* User Details */}
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight tracking-wide">
                {profileUser.name}
              </h1>
              <p className="text-gray-400 text-base font-medium mt-1">@{profileUser.username}</p>
              
              {/* Stats Row */}
              <div className="flex gap-6 text-sm mt-4 text-gray-300">
                <div className="flex gap-1.5 items-center hover:text-white transition cursor-pointer">
                  <span className="font-bold text-white text-base">{profileUser.following?.length || 0}</span>
                  <span>Following</span>
                </div>
                <div className="flex gap-1.5 items-center hover:text-white transition cursor-pointer">
                  <span className="font-bold text-white text-base">{profileUser.followers?.length || 0}</span>
                  <span>Followers</span>
                </div>
              </div>
            </div>

            {/* 3. Action Buttons (Right Side) */}
            <div className="flex items-center gap-3 md:mt-2">
              {children}
            </div>
          </div>

          {/* 4. Bio (Below Info) */}
          {profileUser.bio && (
            <div className="mt-6">
              <p className="text-gray-200 whitespace-pre-wrap text-[15px] leading-relaxed max-w-2xl">
                {profileUser.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}