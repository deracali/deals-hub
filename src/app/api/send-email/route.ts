import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail, dealTitle, dealImage, dealUrl } = await req.json();

    const data = await resend.emails.send({
      from: "Deals Team <noreply@yourdomain.com>",
      to: userEmail,
      subject: `🎉 Your Deal "${dealTitle}" Has Been Approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #ffffff; border-radius: 10px; border: 1px solid #eaeaea;">
          <h2 style="color: #4E61D3;">🎉 Congratulations!</h2>
          <p style="font-size: 16px;">Your deal <strong>${dealTitle}</strong> has been approved and is now live on our platform.</p>

          ${
            dealImage
              ? `<img src="${dealImage}" alt="${dealTitle}" style="width:100%; max-width:500px; border-radius: 8px; margin-top:15px;"/>`
              : ""
          }

          <p style="margin-top: 20px;">You can view it on our website using the link below:</p>
          <a href="${dealUrl || "https://yourwebsite.com/deals"}"
             style="display:inline-block; background-color:#73C8D2; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:600;">
             View My Deal
          </a>

          <p style="margin-top:25px; font-size:14px; color:#555;">
            Thanks for using our platform 💙 <br/>
            — The Deals Team
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return NextResponse.json({ success: false, error });
  }
}
