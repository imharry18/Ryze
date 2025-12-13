/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Existing settings
  reactCompiler: true,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "**", 
      },
      // 2. ADD THIS: Allow Cloudinary images (Crucial for your new backend!)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },

  // 3. ADD THIS: Fix the "Body exceeded 1 MB limit" error
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increases upload limit to 10MB
    },
  },
};

export default nextConfig;