import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!to) throw new Error("Email 'to' is required");

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
}
