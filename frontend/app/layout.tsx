import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; 
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer"; // Import the Footer

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Personal Manager",
  description: "Notes and Bookmarks Manager",
};
// @ts-ignore
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Toaster position="top-right" />
          
          {/* Main Content (grows to push footer down) */}
          <main className="flex-1">
            {children}
          </main>
          
        </AuthProvider>
        
        {/* Footer sits here, visible on ALL pages */}
        <Footer />
      </body>
    </html>
  );
}