import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner"; // Import Toaster

export const metadata = {
  title: "RYZE - College Community",
  description: "Rise, Connect & Compete",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Navbar />
        <div className="pt-20"> 
          {children}
        </div>
        <Footer />
        {/* This enables the toast notifications across the app */}
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}