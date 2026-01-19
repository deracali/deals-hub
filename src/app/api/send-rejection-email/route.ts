import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail, dealTitle, dealImage } = await req.json();

    const data = await resend.emails.send({
      from: "Deals Team <noreply@yourdomain.com>",
      to: userEmail,
      subject: `❌ Your Deal "${dealTitle}" Was Rejected`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff; border-radius: 10px; border: 1px solid #eaeaea;">
          <h2 style="color: #E63946;">We're Sorry 😞</h2>
          <p style="font-size: 16px;">
            Your deal <strong>${dealTitle}</strong> did not meet our approval criteria and has been <strong>rejected</strong>.
          </p>

          ${
            dealImage
              ? `<img src="${dealImage}" alt="${dealTitle}" style="width:100%; max-width:500px; border-radius:8px; margin-top:15px;"/>`
              : ""
          }

          <p style="margin-top:20px;">You can review your deal and submit a new one if you'd like to make changes.</p>
          <a href="https://yourwebsite.com/deals"
             style="display:inline-block;background-color:#4E61D3;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
             Go to Dashboard
          </a>

          <p style="margin-top:25px;font-size:14px;color:#555;">
            If you believe this was an error, please contact our support team. 💬 <br/>
            — The Deals Team
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Rejection email send failed:", error);
    return NextResponse.json({ success: false, error });
  }
}
