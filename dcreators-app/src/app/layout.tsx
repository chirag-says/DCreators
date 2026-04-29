import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

// Layout Components
import TopHeader from "@/components/layout/TopHeader";
import ActionBanner from "@/components/layout/ActionBanner";
import BottomNavigation from "@/components/layout/BottomNavigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DCreators App Dashboard",
  description: "Creative consultant matching and workflow dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col relative pb-[150px] sm:pb-0">
        <TopHeader />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[480px] mx-auto min-h-screen pt-20 px-4 relative">
          {children}
        </main>

        <ActionBanner />
        <BottomNavigation />
      </body>
    </html>
  );
}
