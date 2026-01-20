"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  AlertCircle,
  XCircle,
  Store,
  Plus,
  CheckCircle,
  Clock,
  FileText,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// --- Reusable Components (Defined here for simplicity) ---

// Custom Input Component
const Input = ({ label, name, placeholder, type = "text", error }) => (
  <div className="flex flex-col col-span-1 md:col-span-1">
    <label
      htmlFor={name}
      className={`text-sm font-medium mb-1 ${error ? "text-red-500" : "text-gray-700"}`}
    >
      {label}
      {error && <span className="ml-1 text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      placeholder={placeholder}
      className={`p-3 border rounded-lg bg-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out
        ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"}
      `}
    />
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center">
        <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
        {error}
      </p>
    )}
  </div>
);

// Custom Textarea Component
const TextArea = ({ label, name, placeholder }) => (
  <div className="flex flex-col col-span-2">
    <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows="3"
      placeholder={placeholder}
      className="p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-blue-500 focus:border-blue-500 resize-none transition duration-150 ease-in-out"
    ></textarea>
  </div>
);

// Step Indicator Component
const StepIndicator = ({ number, title, active, complete }) => {
  const baseClasses =
    "flex items-center text-sm font-medium cursor-pointer transition duration-150 ease-in-out";
  const textClasses = complete
    ? "text-gray-900"
    : active
      ? "text-blue-600"
      : "text-gray-500";

  let Icon = Clock;
  let iconClasses = "w-5 h-5 mr-2";

  if (complete) {
    Icon = CheckCircle;
    iconClasses += " text-green-500";
  } else if (active) {
    Icon = FileText;
    iconClasses += " text-blue-600";
  } else {
    Icon = DollarSign; // Placeholder icon for incomplete steps
    iconClasses += " text-gray-400";
  }

  return (
    <div className={`${baseClasses} ${textClasses}`}>
      <span className={active ? "font-bold" : "font-normal"}>
        Step {number}: {title}
      </span>
    </div>
  );
};

// --- Header/Banner Component (Simulated from the image) ---
const HeaderBanner = () => (
  <div className="relative overflow-hidden rounded-t-xl h-42 w-full">
    <Image
      src="/Frame7.png"
      alt="Header Banner"
      width={1200}
      height={250}
      className="w-full h-full object-cover"
      priority
    />
  </div>
);

const StepBadge = ({ step, total, title, complete = false }) => (
  <div className="flex items-center space-x-3">
    <div className="flex items-center">
      {/* The Blue Badge */}
      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
        Step {step}/{total}
      </span>
    </div>

    {/* Step Title */}
    <span className="text-lg font-medium text-gray-900">{title}</span>

    {/* Completion Checkmark (optional based on status) */}
    {complete && <CheckCircle className="w-5 h-5 text-green-500 ml-2" />}
  </div>
);

// --- Main Page Component ---
export default function VendorRegistrationPage() {
  const [formData, setFormData] = useState({});
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const router = useRouter();

  // Add this inside your VendorRegistrationPage component:

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const businessType =
      (form.elements.namedItem("businessType") as HTMLInputElement)?.value ||
      "";
    const businessName =
      (form.elements.namedItem("businessName") as HTMLInputElement)?.value ||
      "";
    const email =
      (form.elements.namedItem("email") as HTMLInputElement)?.value || "";

    if (!businessType || !businessName || !email) {
      alert("Please fill in all required fields (Business type, Name, Email).");
      setLoading(false);
      return;
    }

    // Collect other fields
    const vendorData = {
      businessType,
      businessName,
      businessDescription:
        (form.elements.namedItem("businessDescription") as HTMLTextAreaElement)
          ?.value || "",
      cacNumber:
        (form.elements.namedItem("cacNumber") as HTMLInputElement)?.value || "",
      businessWebsite:
        (form.elements.namedItem("businessWebsite") as HTMLInputElement)
          ?.value || "",
      email,
      phoneNumber:
        (form.elements.namedItem("phoneNumber") as HTMLInputElement)?.value ||
        "",
      state:
        (form.elements.namedItem("state") as HTMLInputElement)?.value || "",
      city: (form.elements.namedItem("city") as HTMLInputElement)?.value || "",
      fullAddress:
        (form.elements.namedItem("fullAddress") as HTMLTextAreaElement)
          ?.value || "",
    };

    // Small delay so "Saving..." shows
    await new Promise((resolve) => setTimeout(resolve, 300));

    localStorage.setItem("vendorData", JSON.stringify(vendorData));

    setLoading(false);
    router.push("/vendor/upload");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8 lg:p-12">
        {/* Header Banner */}
        <HeaderBanner />

        {/* Container to reduce width and center content */}
        <div className="max-w-8xl w-full mx-auto px-4 sm:px-6">
          <div className="w-full mx-auto">
            {/* Back Button */}
            <button
              onClick={() => console.log("Go back")}
              className="flex items-center cursor-pointer mt-4 text-gray-900 text-base mb-8 hover:opacity-75 transition duration-150"
            >
              <Image
                src="/arrowbendleft.png"
                alt="Back"
                width={20}
                height={20}
                className="mr-1"
                priority
              />
              Back
            </button>

            {/* Title Block: Icon, H1, and Subtext */}
            <div className="flex items-start space-x-4 mb-8">
              <div className="p-4 bg-blue-100 rounded-xl flex-shrink-0">
                <Store className="w-8 h-8 text-blue-600" />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
                  Become a Vendor
                </h1>
                <p className="text-gray-600 text-base">
                  Join Nigeria's leading deals platform
                </p>
              </div>
            </div>

            {/* Step Indicator */}
            <StepBadge step={1} total={3} title="Business profile" />
          </div>

          {/* Form */}
          <form className="mt-8" noValidate onSubmit={handleSave}>
            <div
              className={`space-y-6 ${activeStep !== 1 ? "opacity-50" : ""}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Row 1: Business Type & Name */}
                <Input
                  label="Business type"
                  name="businessType"
                  placeholder="Input text field"
                />
                <Input
                  label="Business name"
                  name="businessName"
                  placeholder="Input text field"
                />

                {/* Row 2: Business Description */}
                <div className="col-span-1 md:col-span-2">
                  <TextArea
                    label="Business description"
                    name="businessDescription"
                    placeholder="Enter a brief description of your services or business type"
                  />
                </div>

                {/* Row 3: CAC Registration & Website */}
                <Input
                  label="CAC Registration number"
                  name="cacNumber"
                  placeholder="Input text field"
                />
                <Input
                  label="Business website"
                  name="businessWebsite"
                  placeholder="Input text field"
                />

                {/* Row 4: Email */}
                <div className="col-span-1 md:col-span-2">
                  <Input
                    label="Email Address"
                    name="email"
                    placeholder="Input text field"
                    type="email"
                  />
                </div>

                {/* Row 5: Phone */}
                <div className="col-span-1 md:col-span-2">
                  <Input
                    label="Business Phone Number"
                    name="phoneNumber"
                    placeholder="Input text field"
                    type="tel"
                  />
                  <p className="text-xs text-green-500 mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 text-green-500" />
                    You can add up to two phone numbers
                  </p>
                </div>

                {/* Row 6: State & City */}
                <Input
                  label="State"
                  name="state"
                  placeholder="Input text field"
                />
                <Input
                  label="City"
                  name="city"
                  placeholder="Input text field"
                />

                {/* Row 7: Full Address */}
                <div className="col-span-1 md:col-span-2">
                  <TextArea
                    label="Full Business Address"
                    name="fullAddress"
                    placeholder="Enter your full business address. Enter street names, nearest bus stop, Zip code"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-12 w-full">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Cancel */}
                <button
                  type="button"
                  className="w-full lg:w-1/2 flex items-center justify-center py-3 border border-red-500 bg-white text-red-500 font-semibold rounded-xl hover:bg-red-50 transition order-2 lg:order-1"
                >
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                  Cancel
                </button>

                {/* Save */}
                <button
                  type="submit"
                  className="w-full cursor-pointer lg:w-1/2 flex items-center justify-center py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition order-1 lg:order-2"
                  disabled={loading} // Optional: disable while saving
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Inactive Steps (Simulated) */}
        <div className="mt-6 space-y-3">
          {/* Step 2/3: Documents upload (Inactive - Matches Image) */}
          <div className="flex items-center space-x-2 opacity-50">
            <div className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-500 rounded-full border border-gray-300">
              Step 2/3
            </div>
            <p className="text-gray-500">Documents upload</p>
          </div>

          {/* Step 3/3: Subscription & Plan payment (Inactive - Matches Image) */}
          <div className="flex items-center space-x-2 opacity-50">
            <div className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-500 rounded-full border border-gray-300">
              Step 3/3
            </div>
            <p className="text-gray-500">Subscription & Plan payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// NOTE: To make the icons (ChevronLeft, Plus, CheckCircle, etc.) work, you'll need to install 'lucide-react'.
// Command: npm install lucide-react
