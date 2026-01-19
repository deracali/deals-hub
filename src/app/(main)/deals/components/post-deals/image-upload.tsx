"use client";

import Icon from "@/components/ui/icon";
import { Plus, CheckCircle2, RefreshCcw } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export type ImageData = {
  id: number | string;
  url: string;
  file: File | null;
  name: string;
};

export type ImageFormState = {
  images: ImageData[];
};

export type ImageUploadSectionProps = {
  formData: ImageFormState;
  setFormData: React.Dispatch<React.SetStateAction<any>>; // important
};

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  formData,
  setFormData,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ----------------------------------
     Normalize string images ONCE
  -----------------------------------*/
  useEffect(() => {
    if (!Array.isArray(formData.images)) return;

    const needsNormalization = formData.images.some(
      (img: any) => typeof img === "string",
    );

    if (!needsNormalization) return;

    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.map((img: any, index: number) =>
        typeof img === "string"
          ? {
              id: `${Date.now()}-${index}`,
              url: img,
              name: img.split("/").pop() || `image_${index + 1}`,
              file: null,
            }
          : img,
      ),
    }));
  }, [formData.images, setFormData]);

  /* ----------------------------------
     Drag handlers
  -----------------------------------*/
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  /* ----------------------------------
     File input handler (ADD or REPLACE)
  -----------------------------------*/
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;

    // 🔁 Replace image
    if (replaceIndex !== null) {
      const file = files[0];
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/"))
        return;

      setFormData((prev) => {
        const updated = [...prev.images];
        updated[replaceIndex] = {
          id: Date.now(),
          url: URL.createObjectURL(file),
          file,
          name: file.name,
        };
        return { ...prev, images: updated };
      });

      setReplaceIndex(null);
      e.target.value = "";
      return;
    }

    // ➕ Add new images
    handleFiles(files);
    e.target.value = "";
  };

  /* ----------------------------------
     Add images
  -----------------------------------*/
  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );

    const spaceLeft = 5 - formData.images.length;
    if (spaceLeft <= 0) return;

    const newMedia = validFiles.slice(0, spaceLeft).map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file,
      name: file.name,
    }));

    if (newMedia.length) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newMedia],
      }));
    }
  };

  const isPopulated = formData.images.length > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <label className="text-[15px] font-medium text-gray-500">
          Upload product images
        </label>
        <span className="text-[14px] text-gray-400">
          {formData.images.length}/5 images
        </span>
      </div>

      {/* Upload container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full min-h-[320px] bg-[#F8F9F9] rounded-[32px] border border-gray-100 flex items-center justify-center cursor-pointer transition ${
          dragActive ? "bg-gray-100 scale-[0.99]" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {!isPopulated ? (
          /* Empty state */
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border">
              <Icon name="Upload" size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold mb-1">
              Click or drag to upload
            </p>
            <p className="text-gray-400 text-sm">
              PNG, JPG or MP4 (Max 5 files)
            </p>
          </div>
        ) : (
          /* Populated state */
          <div className="flex flex-col items-center">
            {/* Thumbnails */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              {formData.images.map((media, index) => (
                <div
                  key={media.id}
                  className="relative w-28 h-28 rounded-[14px] overflow-hidden border border-gray-200"
                >
                  {/* 🔁 Replace icon (TOP RIGHT) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplaceIndex(index);
                      fileInputRef.current?.click();
                    }}
                    className="absolute cursor-pointer top-1 right-1 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center hover:bg-white transition"
                    aria-label="Replace image"
                  >
                    <RefreshCcw size={14} className="text-gray-700" />
                  </button>

                  {/* Image */}
                  <img
                    src={media.url}
                    alt={media.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Add more */}
              {formData.images.length < 5 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="w-28 h-28 rounded-[14px] border-2 border-[#22C55E] bg-white flex items-center justify-center cursor-pointer"
                >
                  <Plus
                    size={24}
                    strokeWidth={2.5}
                    className="text-[#22C55E]"
                  />
                </div>
              )}
            </div>

            {/* Success text */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-800 font-bold text-lg">
                {formData.images[0]?.name}
                {formData.images.length > 1 &&
                  ` & ${formData.images.length - 1} others`}
              </span>
              <div className="flex items-center gap-1 text-[#22C55E] text-sm italic font-medium">
                Upload Successful
                <CheckCircle2 size={18} fill="#22C55E" className="text-white" />
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-2 bg-[#22C55E] rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadSection;
