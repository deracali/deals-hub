"use client";

import AppImage from "@/components/ui/app-image";

const CommunitySection = () => {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Mobile Image */}
          <AppImage
            src="/join.png"
            alt="Community Section Mobile"
            width={768}
            height={1024}
            className="mx-auto rounded-2xl sm:hidden"
          />

          {/* Desktop / Tablet Image */}
          <AppImage
            src="/Frame 2147223548.png"
            alt="Community Section"
            width={1920}
            height={1080}
            className="mx-auto rounded-2xl hidden sm:block"
          />
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
