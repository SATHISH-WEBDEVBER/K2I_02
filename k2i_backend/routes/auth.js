const express  = require("express");
const router   = express.Router();
const crypto   = require("crypto");
const jwt      = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");

const User = require("../models/User");
const { generateToken, protect } = require("../middleware/authMiddleware");
const { sendOtpEmail, sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/email");

// ─── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 15,
  message: { success: false, message: "Too many attempts. Wait 15 minutes." },
  standardHeaders: true, legacyHeaders: false,
});
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 5,
  message: { success: false, message: "Too many OTP attempts. Try again in 10 minutes." },
});

// ── Helper: generate short-lived "OTP pending" token ──────────────────────────
const generateOtpPendingToken = (userId) =>
  jwt.sign({ id: userId, otpPending: true }, process.env.JWT_SECRET, { expiresIn: "10m" });

const verifyOtpPendingToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.otpPending) return null;
    return decoded;
  } catch { return null; }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNUP — Step 1: Create unverified user → send OTP
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/signup", authLimiter, [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password needs uppercase, lowercase & number"),
  body("phone").optional().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { name, email, password, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    
    if (user && user.isActive) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    if (user) {
      user.name = name;
      user.password = password;
      user.phone = phone || "";
    } else {
      user = new User({ name, email, password, phone: phone || "", isActive: false });
    }

    const otp = user.generateOtp("signup");
    await user.save();

    try {
      await sendOtpEmail(user.email, user.name, otp, "signup");
    } catch (mailErr) {
      console.error("Signup OTP email failed:", mailErr.message);
      return res.status(500).json({ success: false, message: "Failed to send OTP email." });
    }

    res.status(200).json({
      success: true,
      requireOtp: true,
      otpToken: generateOtpPendingToken(user._id),
      maskedEmail: user.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
      message: "OTP sent to your email to verify your account.",
    });
  } catch (err) {
    console.error("Signup:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNUP — Step 2: Verify OTP → Activate account & issue full JWT
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/verify-signup-otp", otpLimiter, [
  body("otpToken").notEmpty().withMessage("OTP token missing"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("Enter the 6-digit OTP"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { otpToken, otp } = req.body;

  const decoded = verifyOtpPendingToken(otpToken);
  if (!decoded) return res.status(401).json({ success: false, message: "OTP session expired. Please sign up again." });

  try {
    const user = await User.findById(decoded.id).select("+signupOtp +signupOtpExpires");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (!user.verifyOtp(otp, "signup")) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP." });
    }

    user.isActive = true;
    user.signupOtp = undefined;
    user.signupOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    sendWelcomeEmail(user.email, user.name).catch(e => console.error("Welcome email:", e.message));

    res.status(201).json({
      success: true,
      message: "Account verified and created! Welcome to K2I.",
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Verify signup OTP:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN — Step 1: verify password → send OTP
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/login", authLimiter, [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password +loginOtp +loginOtpExpires");
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });

    if (user.isLocked()) {
      const min = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ success: false, message: `Account locked. Try again in ${min} min.` });
    }
    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account deactivated. Contact support." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const left = Math.max(0, 5 - user.loginAttempts);
      return res.status(401).json({
        success: false,
        message: `Invalid email or password.${left > 0 ? ` ${left} attempt(s) left.` : " Account locked for 15 min."}`,
      });
    }

    const otp = user.generateOtp("login");
    await user.save({ validateBeforeSave: false });

    try {
      await sendOtpEmail(user.email, user.name, otp, "login");
    } catch (mailErr) {
      console.error("OTP email failed:", mailErr.message);
      return res.status(500).json({ success: false, message: "Failed to send OTP. Try again." });
    }

    res.status(200).json({
      success: true,
      requireOtp: true,
      otpToken: generateOtpPendingToken(user._id),
      maskedEmail: user.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
      message: "OTP sent to your email.",
    });
  } catch (err) {
    console.error("Login:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN — Step 2: verify OTP → issue full JWT
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/verify-login-otp", otpLimiter, [
  body("otpToken").notEmpty().withMessage("OTP token missing"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("Enter the 6-digit OTP"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { otpToken, otp } = req.body;

  const decoded = verifyOtpPendingToken(otpToken);
  if (!decoded) return res.status(401).json({ success: false, message: "OTP session expired. Please log in again." });

  try {
    const user = await User.findById(decoded.id).select("+loginOtp +loginOtpExpires");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (!user.verifyOtp(otp, "login"))
      return res.status(401).json({ success: false, message: "Invalid or expired OTP." });

    user.loginOtp        = undefined;
    user.loginOtpExpires = undefined;
    user.loginAttempts   = 0;
    user.lockUntil       = null;
    user.lastLogin       = new Date();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Verify login OTP:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD — Step 1: send OTP to email
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/forgot-password", rateLimit({ windowMs: 60*60*1000, max: 5 }), [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: "Invalid email." });

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        requireOtp: true,
        message: "If that email exists, an OTP has been sent.",
      });
    }

    const otp = user.generateOtp("forgot");
    await user.save({ validateBeforeSave: false });

    try {
      await sendOtpEmail(user.email, user.name, otp, "forgot");
      res.status(200).json({
        success: true,
        requireOtp: true,
        otpToken: generateOtpPendingToken(user._id),
        maskedEmail: user.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
        message: "OTP sent to your email. Valid for 10 minutes.",
      });
    } catch (mailErr) {
      user.forgotOtp = undefined;
      user.forgotOtpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Forgot OTP email:", mailErr.message);
      res.status(500).json({ success: false, message: "Failed to send OTP. Try again." });
    }
  } catch (err) {
    console.error("Forgot password:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD — Step 2: verify OTP → return reset token
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/verify-forgot-otp", otpLimiter, [
  body("otpToken").notEmpty().withMessage("OTP session token missing"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("Enter the 6-digit OTP"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  const { otpToken, otp } = req.body;

  const decoded = verifyOtpPendingToken(otpToken);
  if (!decoded) return res.status(401).json({ success: false, message: "OTP session expired. Start again." });

  try {
    const user = await User.findById(decoded.id).select("+forgotOtp +forgotOtpExpires");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (!user.verifyOtp(otp, "forgot"))
      return res.status(401).json({ success: false, message: "Invalid or expired OTP." });

    const resetToken = user.generatePasswordResetToken();
    user.forgotOtp        = undefined;
    user.forgotOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      resetToken,
      message: "OTP verified. You may now reset your password.",
    });
  } catch (err) {
    console.error("Verify forgot OTP:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESET PASSWORD — Step 3: new password
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/reset-password/:token", [
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Needs uppercase, lowercase & number"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) return res.status(400).json({ success: false, message: "Reset link is invalid or expired." });

    user.password            = req.body.password;
    user.passwordResetToken  = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts       = 0;
    user.lockUntil           = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
      token: generateToken(user._id),
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Reset password:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// RESEND OTP (signup, login, or forgot)
// ═══════════════════════════════════════════════════════════════════════════════
router.post("/resend-otp", otpLimiter, [
  body("otpToken").notEmpty(),
  body("type").isIn(["login", "forgot", "signup"]).withMessage("Invalid type"),
], async (req, res) => {
  const { otpToken, type } = req.body;
  const decoded = verifyOtpPendingToken(otpToken);
  if (!decoded) return res.status(401).json({ success: false, message: "Session expired. Start again." });

  try {
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const otp = user.generateOtp(type);
    await user.save({ validateBeforeSave: false });
    await sendOtpEmail(user.email, user.name, otp, type);

    res.status(200).json({
      success: true,
      otpToken: generateOtpPendingToken(user._id),
      maskedEmail: user.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
      message: "New OTP sent.",
    });
  } catch (err) {
    console.error("Resend OTP:", err);
    res.status(500).json({ success: false, message: "Failed to resend OTP." });
  }
});

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch { res.status(500).json({ success: false, message: "Server error." }); }
});

router.post("/logout", protect, (req, res) =>
  res.status(200).json({ success: true, message: "Logged out." })
);

module.exports = router;