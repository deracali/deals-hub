"use client";

import { useEffect, Suspense } from "react"; // 1. Import Suspense
import { useRouter, useSearchParams } from "next/navigation";

// 2. Move your logic into a separate internal component
function MagicCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token || !userId) {
      router.push("/login");
      return;
    }

    localStorage.setItem("token", token);

    fetch(`${baseURL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user) => {
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/Preferences");
      })
      .catch(() => {
        router.push("/login");
      });
  }, [params, router, baseURL]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Signing you in…</p>
    </div>
  );
}

// 3. The main export just wraps the content in Suspense
export default function MagicCallback() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <p>Loading session...</p>
      </div>
    }>
      <MagicCallbackContent />
    </Suspense>
  );
}
