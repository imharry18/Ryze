import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner"; 
import AuthGuard from "@/components/layout/AuthGuard"; 
import MainLayout from "@/components/layout/MainLayout"; // Import MainLayout

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
          <AuthGuard>
            {/* MainLayout handles the Sidebar vs Full Width logic */}
            <MainLayout>
              {children}
            </MainLayout>
          </AuthGuard>
        </div>
        <Footer />
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}