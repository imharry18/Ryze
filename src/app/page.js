'use client';

import { useAuth } from "@/hooks/useAuth";
import FeedLayout from "@/components/feed/FeedLayout";
import { Loader2, ArrowRight, Users, Trophy, Megaphone, Ghost, Zap, Shield, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

// --- Ultra-Smooth Animation Variants ---
// Using Apple-style cubic bezier for buttery smoothness
const customEase = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: customEase } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

// --- Landing Page Components ---

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
      {/* Deep Blue Ambient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600 blur-[150px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-800 blur-[120px]"
        />
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          {/* Animated Campus Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold tracking-wide text-blue-200 uppercase">The Ultimate Campus Network</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
            Unify Your College <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              Experience.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-medium">
            RYZE is the central hub for your campus. From organizing sports tournaments to anonymous confessions, stay connected with everything happening in your college.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link href="/register" className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-full text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              <span className="relative z-10">Join the Community</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white/5 text-white font-bold rounded-full text-lg border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors flex items-center justify-center">
              Login
            </Link>
          </motion.div>
        </motion.div>

        {/* Abstract App Mockup Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: customEase }}
          className="mt-24 relative mx-auto w-full max-w-5xl aspect-[16/9] md:aspect-[21/9] rounded-t-3xl border-t border-x border-white/10 bg-[#0c0c0f]/80 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-blue-900/20"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          
          {/* Mockup Header */}
          <div className="h-14 border-b border-white/5 flex items-center px-6 gap-3 bg-black/40">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
            <div className="mx-auto w-48 h-6 bg-white/5 rounded-full" />
          </div>

          {/* Mockup Body - Representing Ryze Layout */}
          <div className="p-6 flex gap-6 h-full opacity-80">
            {/* Sidebar */}
            <div className="hidden md:flex w-1/4 h-full flex-col gap-4 border-r border-white/5 pr-6">
              <div className="w-full h-10 bg-white/10 rounded-lg" />
              <div className="w-3/4 h-10 bg-white/5 rounded-lg" />
              <div className="w-5/6 h-10 bg-white/5 rounded-lg" />
              <div className="w-4/5 h-10 bg-white/5 rounded-lg" />
            </div>
            {/* Feed */}
            <div className="w-full md:w-2/4 h-full flex flex-col gap-6">
              <div className="w-full h-40 bg-gradient-to-br from-blue-900/30 to-black rounded-2xl border border-white/5" />
              <div className="w-full h-full bg-[#121212] rounded-2xl border border-white/5 p-4 flex flex-col gap-4">
                 <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-white/10" />
                    <div className="flex flex-col gap-2 w-full">
                      <div className="w-1/3 h-3 bg-white/10 rounded-full" />
                      <div className="w-1/4 h-2 bg-white/5 rounded-full" />
                    </div>
                 </div>
                 <div className="w-full flex-1 bg-white/5 rounded-xl" />
              </div>
            </div>
            {/* Right Panel */}
            <div className="hidden md:flex w-1/4 h-full flex-col gap-4 border-l border-white/5 pl-6">
              <div className="w-full h-full bg-gradient-to-b from-white/5 to-transparent rounded-2xl" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ProfessionalFeatures = () => {
  return (
    <section className="py-32 bg-[#050505] relative border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <motion.h2 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            Built for <span className="text-blue-500">Students.</span><br />
            Engineered for <span className="text-cyan-400">Scale.</span>
          </motion.h2>
          <motion.p 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-lg text-gray-400"
          >
            Everything you need to navigate campus life, perfectly integrated into one blazing-fast, beautiful platform.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Feature 1 - Large */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
            className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-8 md:p-10 hover:border-blue-500/50 transition-colors duration-500"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-colors duration-700 pointer-events-none" />
            <Trophy className="w-12 h-12 text-blue-500 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Sports & Tournaments</h3>
            <p className="text-gray-400 max-w-md leading-relaxed text-lg">
              Form teams, track live brackets, and dominate the campus leaderboards. Ryze brings professional-grade sports management directly to your college.
            </p>
          </motion.div>

          {/* Feature 2 - Small */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: customEase, delay: 0.2 }}
            className="group relative overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-8 hover:border-orange-500/50 transition-colors duration-500"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[60px] group-hover:bg-orange-500/20 transition-colors duration-700 pointer-events-none" />
            <Megaphone className="w-10 h-10 text-orange-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Campus Notices</h3>
            <p className="text-gray-400 leading-relaxed">
              Never miss an update. Get instantly notified about cultural fests, workshops, and vital announcements.
            </p>
          </motion.div>

          {/* Feature 3 - Small */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: customEase, delay: 0.3 }}
            className="group relative overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-8 hover:border-pink-500/50 transition-colors duration-500"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[60px] group-hover:bg-pink-500/20 transition-colors duration-700 pointer-events-none" />
            <Ghost className="w-10 h-10 text-pink-500 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Anonymous Confessions</h3>
            <p className="text-gray-400 leading-relaxed">
              Express yourself freely. Share secrets, crushes, and campus gossip securely with total anonymity.
            </p>
          </motion.div>

          {/* Feature 4 - Large */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: customEase, delay: 0.4 }}
            className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-[#121212] border border-white/10 p-8 md:p-10 hover:border-cyan-500/50 transition-colors duration-500"
          >
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-colors duration-700 pointer-events-none" />
            <Users className="w-12 h-12 text-cyan-400 mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Global Campus Feed</h3>
            <p className="text-gray-400 max-w-md leading-relaxed text-lg">
              A dynamic feed for photos, reels, and discussions. Connect with peers, grow your network, and engage with the pulse of your university.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const ParallaxPerformance = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section ref={containerRef} className="py-32 bg-black relative overflow-hidden border-y border-white/5">
      {/* Subtle Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="z-10">
            <motion.h2 
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: customEase }}
              className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter"
            >
              Next-Gen <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                Infrastructure.
              </span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
              className="text-lg text-gray-400 mb-10 leading-relaxed"
            >
              Ryze isn't just another college project. It's an enterprise-grade platform built on Next.js 16 and Firebase, designed to handle thousands of concurrent students effortlessly.
            </motion.p>
            
            <div className="space-y-8">
              {[
                { icon: Zap, title: "Real-time Sync", desc: "Chats and feeds update instantly without refreshing." },
                { icon: Shield, title: "Data Security", desc: "Enterprise-level auth and secure cloud storage." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: customEase, delay: 0.2 + (idx * 0.1) }}
                  className="flex items-start gap-5 group"
                >
                  <div className="p-3 rounded-2xl bg-[#121212] border border-white/10 group-hover:border-blue-500/50 transition-colors">
                    <item.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xl tracking-tight mb-1">{item.title}</h4>
                    <p className="text-gray-500">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating UI Elements */}
          <div className="relative h-[500px] hidden md:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
            
            <motion.div style={{ y: y1 }} className="absolute left-0 top-10 w-72 bg-[#121212]/90 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
              <div className="text-5xl font-black text-white mb-2 tracking-tighter">1 Platform</div>
              <div className="text-sm text-gray-400 font-medium">To unite your entire campus ecosystem.</div>
            </motion.div>
            
            <motion.div style={{ y: y2 }} className="absolute right-0 bottom-20 w-72 bg-gradient-to-br from-blue-900/40 to-black/80 backdrop-blur-xl border border-blue-500/30 p-6 rounded-3xl shadow-2xl">
              <div className="text-5xl font-black text-cyan-400 mb-2 tracking-tighter">0 Lag</div>
              <div className="text-sm text-blue-200/70 font-medium">Optimized for high-speed interactions.</div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full max-w-4xl bg-gradient-to-t from-blue-600/10 to-transparent rounded-full blur-[150px]" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: customEase }}
          className="max-w-4xl mx-auto bg-[#121212]/60 border border-white/10 backdrop-blur-3xl rounded-[3rem] p-12 md:p-24 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-sm">Ryze</span> up?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
            Join thousands of students already connecting, playing, and sharing on the ultimate college platform.
          </p>
          
          <Link href="/register">
            <button className="px-10 py-5 bg-white text-black font-black rounded-full text-xl shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95">
              Create Your Account
            </button>
          </Link>
          <p className="mt-8 text-sm text-gray-500 font-medium">Setup takes less than 60 seconds.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default function HomePage() {
  const { user, loading } = useAuth();

  // 1. Show Spinner while checking Auth
  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  // 2. If logged in, show the actual App Feed
  if (user) {
    return <FeedLayout contentType="following" />;
  }

  // 3. If NOT logged in, show the End-Level Landing Page
  return (
    <main className="min-h-screen bg-black selection:bg-blue-500/30 selection:text-white flex flex-col font-sans">
      <HeroSection />
      <ProfessionalFeatures />
      <ParallaxPerformance />
      <CTASection />
    </main>
  );
}