"use client"; // We need this for framer-motion and react hooks

import Link from "next/link";
// CHANGED: Path to lowercase 'button' to match build error logs
import { Button } from './ui/Button.jsx'; 
import { motion } from 'framer-motion'; // Import framer-motion

// A component for the floating background shapes
const BackgroundShape = ({ className, ...props }) => {
  return (
    <motion.div
      className={`absolute rounded-full filter blur-[150px] opacity-30 ${className}`}
      // Animation properties
      initial={{ y: 0, x: 0 }}
      animate={{
        y: [0, -20, 0, 20, 0],
        x: [0, 10, -10, 0, 10],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      {...props}
    />
  );
};

// Animation variants for the text content
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: "easeOut" },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden
                      bg-black text-white
                      flex flex-col items-center justify-center">
      
      {/* Background Glow Effect (from before) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[150%] h-[150%] 
                    md:w-[80%] md:h-[130%]
                    blur-[120px] 
                    bg-gradient-radial from-blue-900/40 via-transparent to-transparent
                    opacity-70"
      />
      <div className="absolute bottom-0 left-0 w-full h-1/2
                    bg-gradient-to-t from-blue-950/30 to-transparent" 
      />

      {/* Floating SVG Shapes */}
      <BackgroundShape className="bg-blue-600 w-96 h-96 top-1/4 left-1/4" />
      {/* CHANGED: Replaced purple with a blue shade for a cohesive theme */}
      <BackgroundShape className="bg-blue-800 w-80 h-80 bottom-1/4 right-1/4" />

      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center 
                        text-center px-6 pt-10 pb-12" // CHANGED: Added padding-top to account for fixed navbar
        initial="hidden"
        animate="visible"
        variants={{}} // We'll apply variants to children
      >

        {/* Animated Badge */}
        <motion.div 
          className="mb-6 px-4 py-1.5 border border-blue-400/30 bg-blue-500/10 rounded-full"
          variants={contentVariants}
          custom={0} // Stagger delay index
        >
          <p className="text-sm text-blue-300">
            Welcome to the new <span className="font-bold">RYZE</span> Community
          </p>
        </motion.div>

        {/* Main Heading with Gradient Text */}
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-tight"
          variants={contentVariants}
          custom={1} // Stagger delay index
        >
          Rise With{" "}
          <span className="bg-clip-text text-transparent 
                         bg-gradient-to-r from-blue-400 to-blue-600">
            RYZE
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="mt-6 text-gray-300 text-lg md:text-xl max-w-2xl"
          variants={contentVariants}
          custom={2} // Stagger delay index
        >
          The official platform for students to join college sports, share events,
          explore community posts, and stay connected with every update.
        </motion.p>

        {/* Buttons (using the Button component) */}
        <motion.div 
          className="mt-10 flex flex-col sm:flex-row gap-4"
          variants={contentVariants}
          custom={3} // Stagger delay index
        >
          <Button asChild size="lg" 
                  className="shadow-lg shadow-blue-600/30 
                             hover:shadow-blue-600/50 
                             transform transition-all hover:scale-105">
            <Link href="/register">
              Get Started
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" 
                  className="bg-black/20 text-white border-white/30 
                             backdrop-blur-sm 
                             hover:bg-white/10 
                             transform transition-all hover:scale-105">
            <Link href="/login">
              Login
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}