import Image from "next/image";
import { Users, Truck, Percent, ChevronRight, Plus } from "lucide-react";

// Assets
const riceBagImage = "/Frame 2147223607.png";
const combinedAvatars = "/Frame 196.png";

export default function GroupDealHero() {
  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="flex flex-col md:flex-row gap-6 justify-center md:items-stretch items-center w-full mx-auto">
        {/* Left Card - Rice Deal (Set to a reduced fixed height) */}
        <div
          className="relative w-full md:w-[70%] h-[420px] rounded-[32px] p-8 overflow-hidden text-white shadow-lg flex flex-col justify-between"
          style={{
            backgroundImage: `url('/image 17.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#0081FF",
          }}
        >
          <div className="absolute inset-0 z-0 bg-blue-500/40"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full mb-4 shadow-md">
                <Users size={14} />
                Group deal
              </div>

              <h1 className="text-4xl font-extrabold mb-2 leading-tight">
                Share a Bag
                <br />
                of rice
              </h1>
              <p className="text-sm mb-6 max-w-[280px] opacity-90">
                4 people will share a bag of rice at a wholesale price
              </p>

              {/* Pricing card */}
              <div className="bg-white text-gray-900 p-4 rounded-2xl inline-block shadow-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black">$99999.9</span>
                  <span className="text-gray-400 line-through text-xs font-bold">
                    $100000.00
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                    -25% OFF
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold">
                    You save $69.01
                  </span>
                </div>
              </div>
            </div>

            {/* Badges anchored to bottom */}
            <div className="flex flex-wrap gap-3 mt-auto justify-end">
              <div className="flex items-center gap-2 bg-blue-600/80 px-4 py-2.5 rounded-xl text-[11px] font-bold border border-white/10 backdrop-blur-sm">
                <Users size={16} />
                Slots available: 3 slots of 4 is available
              </div>
              <div className="flex items-center gap-2 bg-orange-500 px-4 py-2.5 rounded-xl text-[11px] font-bold shadow-md">
                <Truck size={16} />
                Delivery fee excluded
              </div>
            </div>
          </div>

          {/* Scaled down Rice Bag */}
          <div className="absolute top-1/2 right-4 transform -translate-y-[40%] translate-x-1/4 w-1/3 md:w-[45%] h-auto z-0 pointer-events-none">
            <div className="relative w-full h-full">
              <Image
                src={riceBagImage}
                alt="Rice Bag"
                width={320}
                height={400}
                className="object-contain"
              />
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-3/4 h-8 bg-blue-900/40 rounded-[50%] blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Right Card - Deal Group (Reduced height to match Left Card) */}
        <div
          className="w-full md:w-[28%] h-[420px] rounded-[32px] p-8 shadow-lg flex flex-col justify-between relative overflow-hidden bg-[#F4F9FF]"
          style={{
            backgroundImage: `url('/image 16.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Floating Icons */}
          <div className="absolute top-4 left-4 p-2 bg-orange-500 rounded-lg shadow-md rotate-[-15deg]">
            <Percent className="text-white" size={14} />
          </div>
          <div className="absolute top-20 -right-2 bg-blue-500 p-2 rounded-lg shadow-md -rotate-12">
            <Percent className="text-white" size={14} />
          </div>

          <div className="flex flex-col items-center text-center mt-4">
            {/* Avatar Stack */}
            <div className="flex items-center justify-center mb-4 scale-90">
              <Image
                src={combinedAvatars}
                alt="Users"
                width={110}
                height={40}
                className="object-contain"
              />
            </div>

            <h2 className="text-xl font-black text-gray-900 mb-2">
              Want a deal group?
            </h2>
            <p className="text-gray-500 text-xs font-bold mb-6 leading-relaxed px-2">
              Join an ongoing deal group and save more together.
            </p>

            <button className="flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold w-full py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              Explore deal group
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Bottom Illustration Space */}
        </div>
      </div>
    </div>
  );
}
