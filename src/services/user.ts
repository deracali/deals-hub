export interface UserProfile {
  type: "regular" | "vendor";
  plan: "free" | "pro" | "premium";
  dealsCount?: number;
  dealsPosted?: number;
  reputation?: number;
  status?: "active" | "suspended";
}

export const getStoredUserId = (): string | null => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const userObj = JSON.parse(storedUser);

    // accept id OR _id from anywhere
    return userObj.id || userObj._id || userObj.userId || null;
  } catch {
    return null;
  }
};

export const fetchUserProfile = async (
  userId: string,
): Promise<UserProfile> => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${baseURL}/users/${userId}`);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to fetch user");
  console.log("RAW PLAN FROM API →", data.plan, typeof data.plan);

  return {
    type: data.type === "vendor" ? "vendor" : "regular",

    // ✅ KEEP PLAN
    plan: data.plan ?? "free",

    dealsCount: data.dealsCount ?? undefined,
    dealsPosted: data.dealsPosted ?? undefined,
    reputation: data.reputation ?? 0,
    status: data.status ?? "active",
  };
};
