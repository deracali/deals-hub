"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Store,
  CheckCircle2,
  XCircle,
  ChevronsUpDown,
  UploadCloud,
  Camera,
  Pencil,
  CheckCircle,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  // --- State Management (kept your original names/approach) ---
  const [docFile, setDocFile] = useState(null); // File object for business document
  const [logoFilePreview, setLogoFilePreview] = useState(null); // preview URL string (like earlier)
  const [logoFileObj, setLogoFileObj] = useState(null); // actual File
  const [isDocDragging, setIsDocDragging] = useState(false);
  const router = useRouter();
  // New: passport, identity, banner
  const [passportFileObj, setPassportFileObj] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);

  const [identityFileObj, setIdentityFileObj] = useState(null);
  const [identityPreview, setIdentityPreview] = useState(null);

  const [bannerFileObj, setBannerFileObj] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null); // 'doc' | 'logo' | 'passport' | 'identity' | 'banner'

  const [saving, setSaving] = useState(false);

  // --- Handlers for Document Upload ---
  const handleDocDragOver = (e) => {
    e.preventDefault();
    setIsDocDragging(true);
  };

  const handleDocDragLeave = (e) => {
    e.preventDefault();
    setIsDocDragging(false);
  };

  const handleDocDrop = (e) => {
    e.preventDefault();
    setIsDocDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setDocFile(e.dataTransfer.files[0]);
    }
  };

  const handleDocChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  // --- Handlers for Logo Upload (preserve your preview behavior but keep the file too) ---
  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      // release previous preview URL if blob
      if (logoFilePreview && logoFilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoFilePreview);
      }
      setLogoFilePreview(previewUrl);
      setLogoFileObj(file);
    }
  };

  // passport
  const handlePassportChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      if (passportPreview && passportPreview.startsWith("blob:"))
        URL.revokeObjectURL(passportPreview);
      setPassportPreview(preview);
      setPassportFileObj(file);
    }
  };

  // identity
  const handleIdentityChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      if (identityPreview && identityPreview.startsWith("blob:"))
        URL.revokeObjectURL(identityPreview);
      setIdentityPreview(preview);
      setIdentityFileObj(file);
    }
  };

  // banner
  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      if (bannerPreview && bannerPreview.startsWith("blob:"))
        URL.revokeObjectURL(bannerPreview);
      setBannerPreview(preview);
      setBannerFileObj(file);
    }
  };

  // --- Handlers for Deletion (expanded to support all types) ---
  const initiateDelete = (type) => {
    setFileToDelete(type);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (fileToDelete === "doc") {
      setDocFile(null);
    } else if (fileToDelete === "logo") {
      if (logoFilePreview && logoFilePreview.startsWith("blob:"))
        URL.revokeObjectURL(logoFilePreview);
      setLogoFilePreview(null);
      setLogoFileObj(null);
    } else if (fileToDelete === "passport") {
      if (passportPreview && passportPreview.startsWith("blob:"))
        URL.revokeObjectURL(passportPreview);
      setPassportPreview(null);
      setPassportFileObj(null);
    } else if (fileToDelete === "identity") {
      if (identityPreview && identityPreview.startsWith("blob:"))
        URL.revokeObjectURL(identityPreview);
      setIdentityPreview(null);
      setIdentityFileObj(null);
    } else if (fileToDelete === "banner") {
      if (bannerPreview && bannerPreview.startsWith("blob:"))
        URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
      setBannerFileObj(null);
    }

    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  // --- Utility: convert File -> DataURL ---
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

  // --- Save handler: convert files and save to localStorage (match your DB fields) ---
  // --- Utility: Compress and convert File -> Low-res DataURL ---
  const compressImage = (file, maxWidth = 800, quality = 0.7) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);

      // If it's a PDF, we can't compress via canvas, just return as is
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize logic
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with lower quality to save space
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
      };
      reader.onerror = (err) => reject(err);
    });

  // --- Updated Save handler ---
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // We use compressImage instead of fileToDataUrl
      const cacDocumentDataUrl = await compressImage(docFile);
      const businessLogoDataUrl = logoFileObj
        ? await compressImage(logoFileObj)
        : logoFilePreview || null;
      const passportDataUrl = await compressImage(passportFileObj);
      const identityDataUrl = await compressImage(identityFileObj);
      const bannerDataUrl = await compressImage(bannerFileObj, 1200); // Banners can be wider

      const payload = {
        cacDocument: cacDocumentDataUrl,
        businessLogo: businessLogoDataUrl,
        passportPhoto: passportDataUrl,
        identityImg: identityDataUrl,
        businessBanner: bannerDataUrl,
      };

      // Check size before saving
      const stringified = JSON.stringify(payload);
      const sizeInMb = (new Blob([stringified]).size / (1024 * 1024)).toFixed(
        2,
      );

      console.log(`Payload size: ${sizeInMb} MB`);

      if (parseFloat(sizeInMb) > 4.5) {
        alert("Files are still too large. Please upload smaller images.");
        setSaving(false);
        return;
      }

      localStorage.setItem("vendorUploads", stringified);

      await new Promise((r) => setTimeout(r, 400));
      router.push("/vendor/subscription");
    } catch (err) {
      console.error("❌ Error saving files:", err);
      alert("Storage Full: Try using smaller image files.");
    } finally {
      setSaving(false);
    }
  };
  return (
    // your original container preserved
    <main className="min-h-screen bg-white-100 py-4 px-2 sm:px-4 md:px-6 relative">
      {/* Placeholder Image Source for Logo (if needed) - You should replace this */}
      <div className="hidden">
        {/* This is just a conceptual placeholder for the image source */}
        <img src="/placeholder-logo.png" alt="Placeholder" />
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            {/* Centered Trash Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
            </div>

            {/* Remove Text */}
            <h3 className="text-center  text-lg font-bold text-gray-900 mb-6">
              Remove{" "}
              {fileToDelete === "doc"
                ? "Document"
                : fileToDelete === "logo"
                  ? "Logo"
                  : fileToDelete}
            </h3>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 cursor-pointer py-2.5 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 cursor-pointer py-2.5 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 shadow-sm shadow-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto bg-white rounded-[20px] shadow-sm overflow-hidden relative z-0">
        {/* Header Banner Image: smaller height on mobile */}
        <div className="relative w-full h-32 sm:h-48 md:h-64 bg-blue-400">
          <img
            src="/frame7.png" // Placeholder image source
            alt="Store Banner"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Content Padding: Smaller on mobile, increasing on sm+ */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Back Link */}
          <a
            href="#"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 font-medium mb-4 transition-colors"
          >
            <Image
              src="/arrowbendleft.png"
              alt="Back"
              width={16}
              height={16}
              className="mr-1"
            />
            <span className="text-sm">Back</span>
          </a>

          {/* Page Title */}
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-blue-100 p-2.5 rounded-xl shrink-0">
              <Store className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                Become a Vendor
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 sm:text-sm">
                Join Nigeria's leading deals platform
              </p>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="mb-8 flex flex-col gap-2">
            <div className="flex items-center justify-between bg-[#F0F7FF] p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-blue-500 font-semibold text-xs">
                  Step 1/3
                </span>
                <span className="text-sm font-bold text-gray-800 sm:text-base">
                  Business profile
                </span>
              </div>
              <Image
                src="/blue-check.png"
                alt="Check"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Step 2/3
                </span>
                <span className="text-base font-extrabold text-gray-900 sm:text-lg">
                  Documents
                </span>
              </div>
              <button className="group flex items-center gap-1 font-medium transition-colors">
                <span className="text-red-500 hover:text-red-600 text-sm">
                  Skip for now
                </span>
                <CheckCircle className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6 mb-10">
            {/* Document Type Select */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Document type
              </label>
              <div className="relative">
                <select className="block w-full appearance-none bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-xl py-3 px-3 leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option>Input text field</option>
                  <option>CAC Registration</option>
                  <option>Utility Bill</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <ChevronsUpDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* --- Upload Business Document Section --- */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Upload business document
              </label>

              <div
                onDragOver={handleDocDragOver}
                onDragLeave={handleDocDragLeave}
                onDrop={handleDocDrop}
                className={`mt-1 flex justify-center px-4 pt-8 pb-10 border-2 border-dashed rounded-xl transition-colors cursor-pointer group
                ${isDocDragging ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-gray-50 hover:bg-gray-100"}`}
              >
                {!docFile ? (
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-10 w-10 text-blue-100 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <UploadCloud className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex text-sm text-gray-500 justify-center font-medium">
                      <span>Drag your file here or</span>
                      <label
                        htmlFor="doc-upload"
                        className="relative cursor-pointer bg-transparent rounded-md font-semibold text-blue-500 focus-within:outline-none hover:text-blue-600 ml-1"
                      >
                        <span>Click to upload</span>
                        <input
                          id="doc-upload"
                          name="doc-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleDocChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-400">
                      Choose an image (PNG, JPEG, WEBP or PDF)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full max-w-sm">
                    <div className="mb-2 relative">
                      <div className="w-8 h-10 bg-white border border-gray-200 rounded-sm flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-red-500" />
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-bl-lg"></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-gray-900 font-bold text-sm">
                        {docFile.name}
                      </span>
                      <span className="text-green-500 text-xs font-medium">
                        Upload Successful
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 fill-current" />
                    </div>

                    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-500 rounded-full"></div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs font-medium">
                      <label
                        htmlFor="doc-upload"
                        className="text-gray-500 hover:text-gray-700 cursor-pointer underline decoration-gray-300"
                      >
                        Change file
                        <input
                          id="doc-upload"
                          name="doc-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleDocChange}
                        />
                      </label>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => initiateDelete("doc")}
                        className="text-red-500 cursor-pointer hover:text-red-600 hover:underline decoration-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- Upload Business Logo Section --- */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Upload business logo
              </label>

              <div className="block w-fit mx-auto relative">
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="mt-1 relative w-24 h-24 mx-auto bg-gray-100 rounded-xl flex items-center justify-center border-2 border-transparent hover:border-gray-200 transition-colors group overflow-hidden">
                    {!logoFilePreview ? (
                      <Camera className="w-6 h-6 text-gray-300 group-hover:text-gray-400 transition-colors" />
                    ) : (
                      <img
                        src={logoFilePreview}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-gray-100 z-10 pointer-events-none">
                      <Pencil className="w-3 h-3 text-blue-500 fill-current" />
                    </div>
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleLogoChange}
                  />
                </label>

                {logoFilePreview && (
                  <button
                    type="button"
                    onClick={() => initiateDelete("logo")}
                    className="absolute -top-1 cursor-pointer -right-1 bg-red-100 text-red-500 p-1 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors z-20"
                    title="Remove Logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* NEW fields: Passport Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Upload passport photo
              </label>
              <div className="mt-1 w-fit mx-auto relative">
                <label htmlFor="passport-upload" className="cursor-pointer">
                  <div className="relative w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-transparent hover:border-gray-200 transition-colors overflow-hidden">
                    {!passportPreview ? (
                      <Camera className="w-6 h-6 text-gray-300" />
                    ) : (
                      <img
                        src={passportPreview}
                        alt="Passport"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-gray-100 z-10 pointer-events-none">
                      <Pencil className="w-3 h-3 text-blue-500 fill-current" />
                    </div>
                  </div>
                  <input
                    id="passport-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePassportChange}
                  />
                </label>

                {passportPreview && (
                  <button
                    type="button"
                    onClick={() => initiateDelete("passport")}
                    className="absolute -top-1 cursor-pointer -right-1 bg-red-100 text-red-500 p-1 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors z-20"
                    title="Remove Passport"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* NEW fields: Identity Image */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Upload identity image
              </label>
              <div className="mt-1 w-fit mx-auto relative">
                <label htmlFor="identity-upload" className="cursor-pointer">
                  <div className="relative w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-transparent hover:border-gray-200 transition-colors overflow-hidden">
                    {!identityPreview ? (
                      <Camera className="w-6 h-6 text-gray-300" />
                    ) : (
                      <img
                        src={identityPreview}
                        alt="Identity"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-gray-100 z-10 pointer-events-none">
                      <Pencil className="w-3 h-3 text-blue-500 fill-current" />
                    </div>
                  </div>
                  <input
                    id="identity-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleIdentityChange}
                  />
                </label>

                {identityPreview && (
                  <button
                    type="button"
                    onClick={() => initiateDelete("identity")}
                    className="absolute -top-1 cursor-pointer -right-1 bg-red-100 text-red-500 p-1 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors z-20"
                    title="Remove Identity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* NEW fields: Business Banner */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                Upload business banner
              </label>
              <div className="mt-1 w-full max-w-md mx-auto relative">
                <label htmlFor="banner-upload" className="cursor-pointer">
                  <div className="relative w-full h-28 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-transparent hover:border-gray-200 transition-colors overflow-hidden">
                    {!bannerPreview ? (
                      <UploadCloud className="w-8 h-8 text-gray-300" />
                    ) : (
                      <img
                        src={bannerPreview}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleBannerChange}
                  />
                </label>

                {bannerPreview && (
                  <button
                    type="button"
                    onClick={() => initiateDelete("banner")}
                    className="absolute -top-1 cursor-pointer -right-1 bg-red-100 text-red-500 p-1 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors z-20"
                    title="Remove Banner"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-3 mb-6">
            <button
              type="button"
              className="w-full cursor-pointer py-3 px-4 bg-white border-2 border-red-400 rounded-xl text-red-500 font-bold text-base hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4 text-red-400 relative top-[1px]" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full cursor-pointer py-3 px-4 bg-blue-500 border-2 border-transparent rounded-xl text-white font-bold text-base hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Step 3: Inactive/Pending */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100 opacity-60">
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 text-gray-400 text-xs font-medium px-2 py-1 rounded-full">
                Step 3/3
              </span>
              <span className="text-sm font-medium text-gray-400">
                Subscription & Plan payment
              </span>
            </div>
            <CheckCircle className="w-5 h-5 text-gray-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
