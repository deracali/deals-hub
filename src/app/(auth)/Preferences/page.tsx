"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Home } from "lucide-react";

// --- Sample Data ---
const CATEGORIES = [
  "Laptops & gadgets",
  "Ear bugs",
  "iPhone",
  "Samsung",
  "Fashion wears",
  "Foods & Diets",
  "Home Appliances",
  "Groceries",
  "Head phones",
  "Vacuum cleaner",
  "Air fryers",
  "Desktop",
  "Computers",
  "TVs",
  "Computers monitors",
  "Keyboard",
  "Musical instruments",
];

// ---------------------------------------------
// MODAL COMPONENT
// ---------------------------------------------
const WelcomeModal = ({ isVisible, onClaimDeals, onGoHome }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/welcome-confetti.png"
            alt="Welcome Graphic"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Welcome Deals Hunter!
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Your Deals Hunter account is ready, find and claim your first deal
          today.
        </p>
        <button
          onClick={onClaimDeals}
          className="w-full flex items-center justify-center py-3 px-4 mb-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
        >
          Claim deals now
        </button>
        <button
          onClick={onGoHome}
          className="w-full flex items-center justify-center py-2 text-sm text-gray-600 font-semibold hover:text-gray-900 transition"
        >
          <Home className="w-4 h-4 mr-1" />
          Go to Home page
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------
// MAIN PAGE COMPONENT
// ---------------------------------------------
export default function PreferencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // --- Google redirect logic ---
  useEffect(() => {
    const userParam = searchParams.get("user");
    const token = searchParams.get("token");

    if (userParam && token) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        console.log("✅ Google user saved:", user);
      } catch (error) {
        console.error("❌ Failed to parse user:", error);
      }
    }
  }, [searchParams]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleClaimDeals = () => {
    setIsModalVisible(false);
    router.push("/deals");
  };

  const handleGoHome = () => {
    setIsModalVisible(false);
    router.push("/");
  };

  // --- NEW: Save preferences to backend ---
  const handleContinue = async () => {
    if (selectedCategories.length === 0) return;

    // --- ENHANCED USER RETRIEVAL ---
    let user = null;
    try {
      const rawData = localStorage.getItem("user");

      if (!rawData) {
        console.error("❌ localStorage key 'user' is completely empty");
        alert("Session missing. Please log in again.");
        return;
      }

      // Parse the data
      user = JSON.parse(rawData);

      // FIX: If the data was "double-stringified" (common in Google Redirects),
      // user will be a string instead of an object. We parse again if so.
      if (typeof user === "string") {
        user = JSON.parse(user);
      }
    } catch (error) {
      console.error("❌ Error parsing user from localStorage:", error);
    }

    // Verify _id exists after cleaning the data
    const userId = user?._id || user?.id;

    if (!userId) {
      console.error(
        "❌ No user ID found in localStorage. Data found was:",
        user,
      );
      alert(
        "Could not verify your User ID. Please try logging out and back in.",
      );
      return;
    }
    // --- END ENHANCED USER RETRIEVAL ---

    setIsSaving(true);

    try {
      const res = await fetch(
        `${baseURL}/users/${userId}/preferences`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Suggestion: If you have a token in localStorage, add it here:
            // "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ preferences: selectedCategories }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Failed to save preferences:", data.message);
        alert(`Error: ${data.message || "Failed to save preferences"}`);
        return;
      }

      console.log("✅ Preferences saved successfully for user:", userId);
      setIsModalVisible(true); // Show welcome modal
    } catch (error) {
      console.error("❌ Error saving preferences:", error);
      alert("Network error: Could not connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = selectedCategories.length;
  const isContinueEnabled = selectedCount > 0 && !isSaving;

  return (
    <div className="bg-white flex flex-col min-h-[100dvh]">
      {/* Header Banner */}
      <div className="shrink-0 w-full bg-white pt-3 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto h-[96px] overflow-hidden rounded-lg">
          <Image
            src="/preference-banner-bg.png"
            alt="Shopping bags banner"
            width={1200}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto w-full max-w-5xl p-6 md:p-10 mt-4 rounded-t-xl md:rounded-xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
        >
          <Image
            src="/arrowbendleft.png"
            alt="Back"
            width={16}
            height={16}
            className="mr-1"
          />
          Back
        </button>

        <div className="flex items-center mb-8">
          <div className="w-16 h-16 mr-2 relative">
            <Image
              src="/sparkle.png"
              alt="Sparkle"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tell us what you like!
            </h1>
            <p className="text-sm text-gray-500">
              Pick the products and deals that interest you to get a
              personalized shopping feed.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors duration-150 ${isSelected ? "bg-green-50 text-green-700 border-green-700 font-bold" : "bg-gray-50 text-gray-500 border-gray-300 hover:border-gray-500"}`}
              >
                {isSelected ? (
                  <Image
                    src="/success-check.png"
                    alt="Selected"
                    width={16}
                    height={16}
                    className="w-4 h-4 mr-1"
                  />
                ) : (
                  <Plus className="w-4 h-4 mr-1 stroke-2 text-gray-400" />
                )}
                {category}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-between gap-4 mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={() => setSelectedCategories([])}
            className="flex items-center justify-center flex-1 py-3 px-6 rounded-lg text-red-500 border-2 border-red-500 font-bold hover:bg-red-50 transition-colors duration-150"
          >
            <span className="mr-2">ⓧ</span>
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!isContinueEnabled}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-colors duration-150 ${isContinueEnabled ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
          >
            {isSaving ? "Saving..." : "Continue to deals"}
          </button>
        </div>
      </div>

      <WelcomeModal
        isVisible={isModalVisible}
        onClaimDeals={handleClaimDeals}
        onGoHome={handleGoHome}
      />
    </div>
  );
}
