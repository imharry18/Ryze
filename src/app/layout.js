import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import AuthGuard from "@/components/layout/AuthGuard";
import MainLayout from "@/components/layout/MainLayout";
import AuthProvider from "@/components/providers/AuthProvider"; // CHANGED

export const metadata = {
  title: "RYZE - College Community",
  description: "Rise, Connect & Compete",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Wrap everything in AuthProvider */}
        <AuthProvider>
          <Navbar />
          <div className="pt-20">
            <AuthGuard>
              <MainLayout>
                {children}
              </MainLayout>
            </AuthGuard>
          </div>
          <Footer />
          <Toaster position="bottom-right" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}