export default function Home() {
  return (
    <div className="flex flex-col w-full relative pb-8 pt-4">

      <div className="w-full space-y-4">
        
        {/* Section 1: Creators in Demand */}
        <section className="rounded-[10px] overflow-hidden border border-gray-400">
           <div className="bg-[#4D4D4D] py-[6px] text-center border-b border-gray-500">
             <h2 className="text-yellow-400 font-sans font-medium text-[15px] tracking-wide">
               Creators in Demand
             </h2>
           </div>
           
           <div className="bg-[#595959] p-[6px] flex gap-[6px] overflow-x-auto min-h-[160px] scrollbar-hide">
             {/* Consultant Card 1 */}
             <div className="min-w-[130px] rounded-lg overflow-hidden flex flex-col justify-end relative h-[140px] bg-gradient-to-br from-orange-400 to-red-800 shadow-sm border border-gray-400">
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 text-center pb-1">
                   <p className="text-yellow-400 text-[10px] font-semibold">Photographer</p>
                </div>
                <div className="relative z-10 bg-[#A64B3B] text-white text-[9px] py-1 text-center font-medium">D101/Shoumik</div>
             </div>

             {/* Consultant Card 2 */}
             <div className="min-w-[130px] rounded-lg overflow-hidden flex flex-col justify-end relative h-[140px] bg-gradient-to-b from-green-500 to-green-900 shadow-sm border border-gray-400">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 text-center pb-1">
                   <p className="text-yellow-400 text-[10px] font-semibold">Designer</p>
                </div>
                <div className="relative z-10 bg-[#00A346] text-white text-[9px] py-1 text-center font-medium">D207/Rajdeep</div>
             </div>
             
             {/* Consultant Card 3 Placeholder */}
             <div className="min-w-[70px] rounded-l-lg overflow-hidden flex flex-col justify-end relative h-[140px] bg-gradient-to-r from-pink-800 to-gray-800 shadow-sm border border-l-0 border-gray-400">
                <div className="relative z-10 bg-[#E03A5F] text-white text-[9px] py-1 text-center font-medium truncate px-1">D30</div>
             </div>
           </div>
        </section>

        {/* Section 2: Photographer's Archive */}
        <section className="rounded-[10px] overflow-hidden border border-gray-400 shadow-sm max-w-full">
           <div className="bg-[#1A1A1A] py-[6px] text-center border-b border-black">
             <h2 className="text-[#C0C0C0] font-sans font-medium text-[15px] tracking-wide">
               Photographer's Archive
             </h2>
           </div>
           
           <div className="bg-[#000000] p-[6px] flex gap-[6px] overflow-x-auto min-h-[140px] scrollbar-hide">
             {/* Card 1 */}
             <div className="min-w-[130px] rounded-md overflow-hidden flex flex-col justify-end h-[120px] bg-gradient-to-t from-orange-800 to-blue-200">
                <div className="bg-[#F28220] text-white text-[9px] py-1 text-center font-medium mt-auto">D105/Sudip</div>
             </div>
             {/* Card 2 */}
             <div className="min-w-[130px] rounded-md overflow-hidden flex flex-col justify-end h-[120px] bg-gradient-to-br from-purple-900 to-black">
                <div className="bg-[#A4A767] text-white text-[9px] py-1 text-center font-medium mt-auto">D101/Shoumik</div>
             </div>
             {/* Card 3 Placeholder */}
             <div className="min-w-[70px] rounded-l-md overflow-hidden flex flex-col justify-end h-[120px] bg-gradient-to-t from-orange-600 to-yellow-300">
                <div className="bg-[#A35165] text-white text-[9px] py-1 text-center font-medium mt-auto truncate px-1">D103/Rahul</div>
             </div>
           </div>
        </section>

        {/* Section 3: Designer's Hub */}
        <section className="rounded-[10px] overflow-hidden border border-gray-400 shadow-sm">
           <div className="bg-[#4E3F30] py-[6px] text-center border-b border-[#30261A]">
             <h2 className="text-[#D9D9D9] font-sans font-medium text-[15px] tracking-wide">
               Designer's Hub
             </h2>
           </div>
           
           <div className="bg-[#5C4F40] p-[6px] flex gap-[6px] overflow-x-auto min-h-[130px] scrollbar-hide">
             {/* Card 1 */}
             <div className="min-w-[130px] rounded-md overflow-hidden flex flex-col justify-end border border-gray-300 h-[120px] bg-[#E8F2E9]">
                <div className="bg-[#A7A965] text-[#333333] font-medium text-[9px] py-1 text-center mt-auto border-t border-gray-200">D201/Rajdeep</div>
             </div>
             {/* Card 2 */}
             <div className="min-w-[130px] rounded-md overflow-hidden flex flex-col justify-end border border-gray-300 h-[120px] bg-[#89C7CC]">
                <div className="bg-[#EE1F3E] text-white font-medium text-[9px] py-1 text-center mt-auto border-t border-gray-200/20">D207/Suita</div>
             </div>
             {/* Card 3 Placeholder */}
             <div className="min-w-[70px] rounded-l-md overflow-hidden flex flex-col justify-end border border-gray-300 border-r-0 h-[120px] bg-[#61A8CF]">
                <div className="bg-[#009BD9] text-white font-medium text-[9px] py-1 text-center mt-auto border-t border-gray-200/20 truncate px-1">D207/Rajib</div>
             </div>
           </div>
        </section>

      </div>
    </div>
  );
}
