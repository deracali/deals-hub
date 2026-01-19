import Image from "next/image";
import React from "react";

function AppImage({
  src,
  alt = "Image Name",
  className = "",
  width = 400,
  height = 400,
  ...props
}: {
  src?: string; // 👈 make optional
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}) {
  // 🚫 Prevent rendering invalid image source
  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/NOIMAGE.png";
      }}
      {...props}
    />
  );
}

export default AppImage;
