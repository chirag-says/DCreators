import { Home, Search, Clock } from "lucide-react";
import Link from "next/link";

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-[60px] bg-[#111111] grid grid-cols-3 items-center z-50">
      <Link href="/" className="flex flex-col items-center justify-center gap-[2px]">
        <Home className="w-6 h-6 text-yellow-500" strokeWidth={1.5} />
        <span className="text-[11px] font-medium text-yellow-500">Home</span>
      </Link>

      <Link href="/search" className="flex flex-col items-center justify-center gap-[2px]">
        <Search className="w-6 h-6 text-[#999999]" strokeWidth={1.5} />
        <span className="text-[11px] font-medium text-[#999999]">Search</span>
      </Link>

      <Link href="/history" className="flex flex-col items-center justify-center gap-[2px]">
        <Clock className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
        <span className="text-[11px] font-medium text-blue-400">History</span>
      </Link>
    </nav>
  );
}
