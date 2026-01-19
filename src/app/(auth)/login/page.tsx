"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Mail } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { signup, googleSignup, SignupForm, GoogleUser } from "@/services/auth";
import AppImage from "@/components/ui/app-image";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isAccountExistsError, setIsAccountExistsError] = useState(false); // New state
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    setIsSent(false);

    try {
      const res = await fetch(`${baseURL}/auth/magiclink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send magic link");
      }

      setIsSent(true);
      setMessage("Link sent to your email address");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `http://localhost:5000/auth/google`;
  };
  const LOADING_DOTS_IMAGE_PATH = "/loading-dots.png";
  const SUCCESS_CHECK_IMAGE_PATH = "/success-check.png";

  // Helper to determine if a red error border should be shown (excluding the green 'exists' case)
  const hasRedError = error && !isAccountExistsError;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* LEFT SIDE — EXACT 50% WIDTH */}
      {/* IMAGE SECTION */}
      <div className="w-full md:w-1/2 relative bg-white">
        {/* SMALL SCREEN IMAGE (TOP, responsive) */}
        <div className="block md:hidden w-full flex justify-center mt-8">
          <div className="relative w-11/12 sm:w-3/4 h-[17vh] rounded-lg overflow-hidden">
            <Image
              src="/signin-bg-sm.png"
              alt="Login Mobile"
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>

        {/* LARGE SCREEN IMAGE (SIDE) */}
        <div className="hidden md:block w-full h-screen relative p-8">
          <Image
            src="/signin-bg-lg.png"
            alt="Login Desktop"
            fill
            priority
            className="object-cover rounded-xl"
          />
        </div>
      </div>

      {/* RIGHT SIDE — EXACT 50% WIDTH */}
      <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center h-screen md:min-h-screen bg-white overflow-y-auto px-12 md:px-32 py-8">
        <div className="w-full max-w-md text-center space-y-6 flex flex-col flex-shrink-0">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Slyce Logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          <h1 className="font-helvetica font-black text-[46px] leading-[50px] tracking-[-2px] text-black w-full max-w-[455px] mx-auto">
            Sign in to save deals
          </h1>

          <p className="font-helvetica font-medium text-[16px] leading-[20px] text-center text-black w-full max-w-[294px] mx-auto">
            Sign in to save your favorite deals and get personalized alerts
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col text-left">
              <label className="font-helvetica font-normal text-[14px] leading-[18px] mb-1 text-[#4D4D4D] block">
                Enter email address
              </label>

              {/* --- INPUT CONTAINER: Conditional Border Color --- */}
              <div
                className={
                  `flex items-center rounded-md w-full max-w-[494px] h-[56px] px-[12px] py-[18px] gap-1 mx-auto
                                    ${hasRedError ? "border-red-500 border-2" : "border border-gray-300"}` // 👈 Uses hasRedError
                }
              >
                <Mail
                  className={
                    `w-5 h-5
                                    ${loading || isSent ? "text-gray-300" : hasRedError ? "text-red-500" : "text-gray-400"}` // 👈 Uses hasRedError
                  }
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                  className="font-helvetica font-medium text-[16px] leading-[20px] placeholder:font-helvetica placeholder:font-medium placeholder:text-[16px] placeholder:leading-[20px] placeholder:text-gray-400 w-full focus:outline-none focus:ring-0 focus:border-transparent disabled:bg-white disabled:cursor-not-allowed"
                  required
                  disabled={loading || isSent}
                />
              </div>

              {/* --- CONDITIONAL MESSAGE DISPLAY --- */}
              {isAccountExistsError ? (
                // 🟢 Green "Account Exists" Message (Matching the image)
                <div className="flex items-center gap-1 mt-1 text-green-600">
                  <img
                    src="/error.png"
                    alt="success icon"
                    className="w-4 h-4"
                  />{" "}
                  {/* Assuming warning.png is used for the icon */}
                  <span className="font-helvetica text-sm leading-[17px] font-bold">
                    This account already exists
                  </span>
                  <a
                    href="/login"
                    className="font-helvetica text-sm leading-[17px] font-bold text-black ml-1"
                  >
                    Log in here
                  </a>
                </div>
              ) : error ? (
                // 🔴 General Error (e.g. Server error, Network error)
                <div className="flex items-center gap-1 mt-1 text-red-500">
                  <img
                    src="/warning.png"
                    alt="error icon"
                    className="w-4 h-4"
                  />
                  <span className="font-helvetica text-sm leading-[17px] font-bold">
                    {error}
                  </span>
                </div>
              ) : (
                // Default Info Text (Gray - only shows if NO errors)
                <div className="flex items-center gap-1 mt-1">
                  <img src="/warning.png" alt="info icon" className="w-4 h-4" />
                  <span className="font-helvetica text-xs text-[#A4A4A4] leading-[17px]">
                    No password needed. We'll email you a link to sign in.
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className={`w-full flex items-center justify-center gap-1 transition-colors duration-200
                                ${
                                  isSent
                                    ? "bg-green-100 text-green-700 hover:bg-green-200" // SUCCESS State
                                    : loading
                                      ? "text-gray-700 border border-gray-300 shadow-inner" // LOADING State
                                      : "bg-blue-500 text-white hover:bg-blue-600" // IDLE State
                                }`}
              disabled={loading || isSent}
              style={loading ? { backgroundColor: "#F0F8FF" } : {}}
            >
              {isSent ? (
                <div className="flex items-center justify-center gap-2">
                  <Image
                    src={SUCCESS_CHECK_IMAGE_PATH}
                    alt="Success checkmark"
                    width={16}
                    height={16}
                  />
                  <span>Link sent to your email address</span>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span>Sending...</span>
                  <Image
                    src={LOADING_DOTS_IMAGE_PATH}
                    alt="Loading dots animation"
                    width={40}
                    height={10}
                  />
                </div>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center gap-2 text-gray-400 my-2">
            <span className="flex-1 border-b border-gray-300"></span>
            <span>OR</span>
            <span className="flex-1 border-b border-gray-300"></span>
          </div>

          {/* GOOGLE BUTTON */}
          <Button
            size="lg"
            variant="outline"
            className="w-full flex justify-center items-center gap-2"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AppImage src="/google.png" width={20} height={20} />
            )}
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
