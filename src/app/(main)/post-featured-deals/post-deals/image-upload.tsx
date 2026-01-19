import AppImage from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

export type ImageData = {
  id: number | string;
  url: string; // for preview only
  file: File; // actual file to upload
  name: string;
};

export type FormData = {
  images: ImageData[];
};

export type ImageUploadSectionProps = {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
};

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  formData,
  setFormData,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    imageFiles.forEach((file) => {
      if (formData.images.length < 5) {
        const newImage: ImageData = {
          id: Date.now() + Math.random(),
          url: URL.createObjectURL(file), // preview only
          file, // keep actual File for upload
          name: file.name,
        };

        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, newImage],
        }));
      }
    });
  };

  const removeImage = (imageId: string | number) => {
    setFormData((prev) => {
      const imageToRemove = prev.images.find((img) => img.id === imageId);
      if (imageToRemove) URL.revokeObjectURL(imageToRemove.url); // free memory
      return {
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      };
    });
  };

  const setAsPrimary = (imageId: string | number) => {
    setFormData((prev) => {
      const images = [...prev.images];
      const primaryIndex = images.findIndex((img) => img.id === imageId);
      if (primaryIndex > 0) {
        const [primaryImage] = images.splice(primaryIndex, 1);
        images.unshift(primaryImage);
      }
      return { ...prev, images };
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Image" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">
            Product Images
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {formData?.images?.length}/5 images
        </span>
      </div>

      {/* Upload Area */}
      {formData?.images?.length < 5 && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Icon
                  name="Upload"
                  size={24}
                  className="text-muted-foreground"
                />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-card-foreground mb-2">
                Drop images here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, GIF up to 10MB each. Maximum 5 images.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef?.current?.click()}
              disabled={formData?.images?.length >= 5}
            >
              <Plus />
              Choose Files
            </Button>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {formData?.images?.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {formData?.images?.map((image, index) => (
              <div
                key={image?.id || index}
                className="relative group bg-muted rounded-lg overflow-hidden aspect-square"
              >
                <AppImage
                  src={image?.url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {index !== 0 && (
                    <button
                      onClick={() => setAsPrimary(image?.id)}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      title="Set as primary"
                    >
                      <Icon name="Star" size={16} color="white" />
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(image?.id)}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    title="Remove image"
                  >
                    <Icon name="Trash2" size={16} color="white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            The first image will be used as the main product image. Click the
            star icon to set a different image as primary.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSection;
