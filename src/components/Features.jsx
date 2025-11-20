"use client";

import React from 'react';
import { motion } from 'framer-motion';
// Import icons from lucide-react (npm install lucide-react)
import { Trophy, Megaphone, Users } from 'lucide-react';

// Define your features with icons
const featuresList = [
  {
    icon: <Trophy className="w-6 h-6 text-blue-400" />,
    title: "Sports Management",
    description: "Create cricket teams, send match challenges, track results, and manage tournaments — all in one place.",
  },
  {
    // CHANGED: Unified icon color to blue
    icon: <Megaphone className="w-6 h-6 text-blue-400" />,
    title: "Events & News",
    description: "Stay updated with every cultural fest, workshop, tech event, and important notice of your college.",
  },
  {
    // CHANGED: Unified icon color to blue
    icon: <Users className="w-6 h-6 text-blue-400" />,
    title: "Community Feed",
    description: "Share posts, announce ideas, drop confessions, and interact with students across your entire campus.",
  }
];

// Animation variant for the main section
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // This will make cards animate one by one
    },
  },
};

// Animation variant for each card
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function Features() {
  return (
    <section className="relative py-24 sm:py-32 text-white px-6 overflow-hidden">
      
      {/* Background glow to continue the Hero's theme */}
      <div className="absolute inset-0 -z-10 flex justify-center">
        <div className="absolute top-0 w-[50vw] h-[50vh] 
                      max-w-4xl 
                      blur-[150px] 
                      bg-gradient-radial from-blue-900/30 via-transparent to-transparent
                      opacity-50"
        />
      </div>

      <motion.div 
        className="max-w-6xl mx-auto text-center"
        initial="hidden"
        whileInView="visible" // Animate when section scrolls into view
        viewport={{ once: true, amount: 0.2 }} // Trigger animation once
        variants={sectionVariants} // Use the container variants
      >
        
        {/* Animated Section Title */}
        <motion.h2 
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          variants={cardVariants} // Cards and title use same entry animation
        >
          Why Choose{" "}
          <span className="bg-clip-text text-transparent 
                         bg-gradient-to-r from-blue-400 to-blue-600">
            RYZE?
          </span>
        </motion.h2>

        <motion.p 
          className="text-lg text-gray-300 max-w-2xl mx-auto mb-16"
          variants={cardVariants}
        >
          A single, unified platform built to connect your entire campus.
        </motion.p>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">

          {featuresList.map((feature, index) => (
            <motion.div
              key={index}
              className="relative p-8 rounded-2xl 
                         bg-gray-900/50 
                         border border-white/10 
                         backdrop-blur-sm 
                         text-left 
                         transform transition-all duration-300
                         hover:scale-[1.02] hover:border-blue-500/50 
                         hover:shadow-xl hover:shadow-blue-600/10"
              variants={cardVariants} // Each card uses the card variant
            >
              {/* Icon Container */}
              {/* CHANGED: Removed conditional logic to unify all icon backgrounds */}
              <div className="p-3 w-fit rounded-lg mb-6
                              bg-blue-600/10 border border-blue-600/30"
              >
                {feature.icon}
              </div>

              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}

        </div>
      </motion.div>
    </section>
  );
}