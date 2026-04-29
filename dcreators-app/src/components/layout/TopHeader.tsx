import { Search, User } from "lucide-react";
import Image from "next/image";

export default function TopHeader() {
  return (
    <header className="fixed top-0 left-0 w-full h-20 flex items-center justify-between px-6 bg-transparent z-50 pt-2 pointer-events-none">
      
      {/* Left Menu & Logo */}
      <div className="flex items-center gap-5 pointer-events-auto">
        {/* Minimal Hamburger Menu */}
        <button className="flex flex-col gap-[6px]">
          <div className="w-7 h-[2px] bg-[#4338CA]"></div>
          <div className="w-7 h-[2px] bg-[#4338CA]"></div>
          <div className="w-7 h-[2px] bg-[#4338CA]"></div>
        </button>
        
        {/* D-Logo */ }
        <Image 
          src="/d-logo.png" 
          alt="D-Creators Logo" 
          width={40} 
          height={40} 
          className="object-contain w-auto h-11"
          priority
        />
      </div>

      {/* Right Icons: Search & User Profile */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <button>
          <Search className="w-8 h-8 text-[#4338CA] stroke-[2.5]" />
        </button>
        <button className="w-8 h-8 rounded-full border-[2.5px] border-[#4338CA] flex items-center justify-center overflow-hidden">
          <User className="w-5 h-5 text-[#4338CA] stroke-[3] mt-1" />
        </button>
      </div>
      
    </header>
  );
}
