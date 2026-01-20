import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail } = await req.json();

    const data = await resend.emails.send({
      from: "Support <noreply@yourdomain.com>",
      to: userEmail,
      subject: "✅ Your Account Has Been Reactivated",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#fff;border-radius:10px;border:1px solid #eee;">
          <h2 style="color:#4E61D3;">Welcome Back!</h2>
          <p>Dear user,</p>
          <p>Your account has been <strong>reactivated</strong> and you can now log in again.</p>
          <a href="https://yourwebsite.com/login"
             style="display:inline-block;background-color:#4E61D3;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:20px;">
             Log In
          </a>
          <p style="margin-top:20px;font-size:13px;color:#777;">— The Support Team</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Reactivation email failed:", error);
    return NextResponse.json({ success: false, error });
  }
}
