import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
      </body>
    </html>
  );
}
