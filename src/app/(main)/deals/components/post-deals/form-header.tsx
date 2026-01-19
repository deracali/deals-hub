import { ChevronLeft, Plus } from "lucide-react"; // Assuming you use lucide-react, or use your <Icon />
import Icon from "@/components/ui/icon";
import Image from "next/image";

const DealFormHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="bg-white px-4 py-6 md:px-8">
      {/* Back Button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
      >
        <ChevronLeft
          size={18}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Header Content */}
      <div className="flex items-start space-x-4">
        {/* Mint Icon Box */}
        <div className="flex items-center justify-center w-14 h-14 bg-[#ECFDF5] border border-[#D1FAE5] rounded-xl shadow-sm overflow-hidden">
          <Image
            src="/Group 26.png" // Replace with your actual image path
            alt="Icon"
            width={28}
            height={28}
            className="object-contain"
            priority
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Submit a deal
          </h1>
          <p className="text-[15px] text-slate-500 mt-1">
            Join Nigeria's leading deals platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealFormHeader;
