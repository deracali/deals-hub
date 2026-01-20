export interface SignupForm {
  name: string;
  email: string;
  password: string;
}

export interface GoogleUser {
  name: string;
  email: string;
}

export interface SignupResponse {
  user?: {
    name: string;
    email: string;
    type?: string;
    role?: string;
    brand?: string;
  };
  token?: string;
  message?: string;
}

// Standard signup
export const signup = async (form: SignupForm): Promise<SignupResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    },
  );

  const data: SignupResponse = await res.json();

  if (!res.ok) throw new Error(data.message || "Signup failed");

  return data;
};

// Google signup (after OAuth login, send user info to backend)
export const googleSignup = async (
  user: GoogleUser,
): Promise<SignupResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, password: "google_auth" }),
    },
  );

  const data: SignupResponse = await res.json();

  if (!res.ok) throw new Error(data.message || "Google signup failed");

  return data;
};
