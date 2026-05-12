import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"PopulousHR" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export function verifyCodeEmail(code) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#13131f;color:#f4f4fa;border-radius:16px">
      <h2 style="color:#f97316;margin-bottom:8px">Verify your email</h2>
      <p style="color:#aaa">Use the code below to verify your PopulousHR account:</p>
      <div style="font-size:36px;font-weight:900;letter-spacing:12px;text-align:center;padding:24px;background:#1e1e2e;border-radius:12px;margin:24px 0;color:#f97316">${code}</div>
      <p style="color:#aaa;font-size:13px">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
    </div>`;
}

export function certificateEmail(studentName, courseTitle) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#13131f;color:#f4f4fa;border-radius:16px">
      <h2 style="color:#f97316">🏆 Certificate of Completion</h2>
      <p>Congratulations <strong>${studentName}</strong>!</p>
      <p>You have successfully completed <strong style="color:#f97316">${courseTitle}</strong> on PopulousHR.</p>
      <p>Log in to your account to view and download your certificate.</p>
      <a href="${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/certificates"
         style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">
        View Certificate
      </a>
    </div>`;
}

export function resetPasswordEmail(resetUrl) {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#13131f;color:#f4f4fa;border-radius:16px">
      <h2 style="color:#f97316">Reset your password</h2>
      <p style="color:#aaa">Click the button below to reset your PopulousHR password. This link expires in 1 hour.</p>
      <a href="${resetUrl}"
         style="display:inline-block;margin-top:16px;padding:12px 24px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">
        Reset Password
      </a>
      <p style="color:#aaa;font-size:13px;margin-top:16px">If you didn't request this, ignore this email.</p>
    </div>`;
}
