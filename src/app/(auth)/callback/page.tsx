"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MagicCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const userId = params.get("userId"); // get userId from query

    if (!token || !userId) {
      router.push("/login");
      return;
    }

    // Store JWT
    localStorage.setItem("token", token);

    // Fetch user info using your endpoint
    fetch(`http://localhost:5000/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user) => {
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/Preferences"); // redirect to home/dashboard
      })
      .catch(() => {
        router.push("/login");
      });
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Signing you in…</p>
    </div>
  );
}
