import { CheckCircle, ShoppingCart } from "lucide-react";

export default function ActionBanner() {
  return (
    <div className="fixed bottom-[60px] left-0 w-full bg-[#EAEAEA] px-5 py-3 flex items-center justify-between z-40 border-t border-gray-300">
      
      {/* Left Action: Assign Project */}
      <button className="flex items-center gap-2 group">
        <CheckCircle className="w-7 h-7 text-red-500" strokeWidth={2} />
        <div className="flex flex-col items-start leading-[1.1]">
          <span className="text-[13px] font-semibold text-gray-800">Assign Project /</span>
          <span className="text-[11px] font-medium text-gray-600">Hire Creative Consultant</span>
        </div>
      </button>

      {/* Right Action: Shop */}
      <button className="flex flex-col items-center justify-center gap-1 group">
        <ShoppingCart className="w-6 h-6 text-indigo-900 fill-indigo-900" />
        <span className="text-[11px] font-semibold text-gray-800 tracking-wide">Shop</span>
      </button>

    </div>
  );
}
