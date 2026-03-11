const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
  });

// ─── OTP Email ────────────────────────────────────────────────────────────────
const sendOtpEmail = async (email, name, otp, type = "login") => {
  const isLogin  = type === "login";
  const subject  = isLogin ? "Your K2I Login OTP" : "K2I Password Reset OTP";
  const heading  = isLogin ? "Login Verification Code" : "Password Reset Code";
  const subtext  = isLogin
    ? "Use this OTP to complete your login. Do not share it with anyone."
    : "Use this OTP to reset your K2I password. Do not share it.";

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"K2I Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
        .wrap{max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden}
        .hdr{background:linear-gradient(135deg,#002b36,#14655b);padding:28px;text-align:center}
        .hdr h1{color:#47ffeb;margin:0;font-size:22px}
        .hdr p{color:#FFF8F0;margin:6px 0 0;opacity:.8;font-size:14px}
        .body{padding:32px 36px}
        .body p{color:#333;line-height:1.7;font-size:15px;margin:0 0 14px}
        .otp-box{background:linear-gradient(135deg,#002b36,#0a3f36);border-radius:12px;padding:24px;text-align:center;margin:22px 0}
        .otp-digits{font-size:42px;font-weight:900;letter-spacing:14px;color:#47ffeb;font-family:monospace}
        .otp-sub{color:rgba(255,248,240,.55);font-size:13px;margin-top:8px}
        .warn{background:#fff3cd;border-left:4px solid #ffc107;padding:11px 15px;border-radius:5px;font-size:13px;color:#856404;margin-top:18px}
        .ftr{background:#002b36;padding:16px;text-align:center;color:#47ffeb;font-size:12px}
      </style></head><body>
      <div class="wrap">
        <div class="hdr"><h1>Knowledge2Intelligence</h1><p>${heading}</p></div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>${subtext}</p>
          <div class="otp-box">
            <div class="otp-digits">${otp}</div>
            <div class="otp-sub">Valid for <strong>10 minutes</strong></div>
          </div>
          <div class="warn">⚠️ Never share this OTP. K2I team will never ask for it.</div>
        </div>
        <div class="ftr">© 2025 K2I | From Knowledge to Intelligence</div>
      </div></body></html>`,
  });
};

// ─── Welcome Email ─────────────────────────────────────────────────────────────
const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"K2I Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to K2I - Knowledge2Intelligence! 🚀",
    html: `
      <!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
        .wrap{max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden}
        .hdr{background:linear-gradient(135deg,#002b36,#14655b);padding:28px;text-align:center}
        .hdr h1{color:#47ffeb;margin:0;font-size:22px}
        .hdr p{color:#FFF8F0;margin:6px 0 0;opacity:.8}
        .body{padding:32px 36px}
        .body p{color:#333;line-height:1.7}
        .ftr{background:#002b36;padding:16px;text-align:center;color:#47ffeb;font-size:12px}
      </style></head><body>
      <div class="wrap">
        <div class="hdr"><h1>Welcome to K2I! 🎉</h1><p>Knowledge2Intelligence Platform</p></div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account has been created. Explore our tutorials, video guides, projects in Tamil & English.</p>
        </div>
        <div class="ftr">© 2025 K2I | From Knowledge to Intelligence</div>
      </div></body></html>`,
  });
};

// ─── Password Reset Email (kept as fallback) ──────────────────────────────────
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"K2I Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset - K2I Platform",
    html: `
      <!DOCTYPE html><html><head><style>
        body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
        .wrap{max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden}
        .hdr{background:linear-gradient(135deg,#002b36,#14655b);padding:28px;text-align:center}
        .hdr h1{color:#47ffeb;margin:0;font-size:22px}
        .body{padding:32px 36px}.body p{color:#333;line-height:1.7;font-size:15px}
        .btn{display:inline-block;background:linear-gradient(135deg,#14655b,#47ffeb);color:#002b36;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin:16px 0}
        .warn{background:#fff3cd;border-left:4px solid #ffc107;padding:11px 15px;border-radius:5px;font-size:13px;color:#856404;margin-top:16px}
        .ftr{background:#002b36;padding:16px;text-align:center;color:#47ffeb;font-size:12px}
      </style></head><body>
      <div class="wrap">
        <div class="hdr"><h1>Knowledge2Intelligence</h1></div>
        <div class="body">
          <p>Hi <strong>${name}</strong>, click below to reset your password:</p>
          <div style="text-align:center"><a href="${resetUrl}" class="btn">Reset Password</a></div>
          <div class="warn">⚠️ Expires in 30 minutes.</div>
        </div>
        <div class="ftr">© 2025 K2I</div>
      </div></body></html>`,
  });
};

module.exports = { sendOtpEmail, sendWelcomeEmail, sendPasswordResetEmail };
