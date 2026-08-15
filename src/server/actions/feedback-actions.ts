"use server";

import { sendMail } from "@/lib/utils/mailer";

export async function submitFeedback(data: { subject: string; category: string; message: string; userEmail: string }) {
  try {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
        <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">New Feedback Received</h2>
        <p><strong>Category:</strong> <span style="background: #f4f4f4; padding: 2px 6px; border-radius: 4px;">${data.category}</span></p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>From:</strong> ${data.userEmail}</p>
        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 6px; white-space: pre-wrap;">
          ${data.message}
        </div>
      </div>
    `;

    await sendMail({
      to: process.env.FROM_EMAIL as string,
      subject: `[Feedback - ${data.category}] ${data.subject}`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending feedback:", error);
    return { success: false, error: "Failed to send feedback" };
  }
}
