import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaLock, FaPhone,
  FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle, FaShieldAlt
} from "react-icons/fa";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import "../assets/Css/Auth.css";

// ── 6-box OTP input (Copied from Login) ────────────────────────────────────────
const OtpInput = ({ value, onChange, disabled }) => {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = digits.map((d, idx) => (idx === i ? "" : d)).join("");
        onChange(next);
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        const next = digits.map((d, idx) => (idx === i - 1 ? "" : d)).join("");
        onChange(next);
      }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = digits.map((d, idx) => (idx === i ? e.key : d)).join("");
    onChange(next);
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) { onChange(pasted); inputs.current[5]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="otp-boxes">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          readOnly
          disabled={disabled}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onClick={() => inputs.current[i]?.focus()}
          className={`otp-box ${d ? "otp-box-filled" : ""}`}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

// ── Password strength scorer ──────────────────────────────────────────────────
const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 0, label: "Weak",   cls: "weak" };
  if (score === 2) return { level: 1, label: "Fair",   cls: "fair" };
  if (score === 3) return { level: 2, label: "Good",   cls: "good" };
  return              { level: 3, label: "Strong", cls: "strong" };
};

const Signup = () => {
  // Make sure verifySignupOtp and resendOtp are provided by your AuthContext
  const { signup, verifySignupOtp, resendOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  // Step 1 state
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Step 2 (OTP) state
  const [step, setStep]           = useState(1); 
  const [otpToken, setOtpToken]   = useState("");
  const [maskedEmail, setMasked]  = useState("");
  const [otp, setOtp]             = useState("");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading]       = useState(false);
  const [alert, setAlert]           = useState({ type: "", msg: "" });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const strength = getStrength(form.password);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Step 1: Submit Form ─────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setAlert({ type: "error", msg: "Please fill in all required fields." });
      return;
    }
    if (form.password !== form.confirm) {
      setAlert({ type: "error", msg: "Passwords do not match." });
      return;
    }
    if (form.password.length < 8) {
      setAlert({ type: "error", msg: "Password must be at least 8 characters." });
      return;
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
      setAlert({ type: "error", msg: "Password must contain an uppercase letter and a number." });
      return;
    }

    setLoading(true);
    try {
      const data = await signup(form.name.trim(), form.email.trim(), form.password, form.phone.trim());
      
      // If the backend requires OTP, move to Step 2
      if (data && data.requireOtp) {
        setOtpToken(data.otpToken);
        setMasked(data.maskedEmail);
        setCountdown(60);
        setStep(2);
      } else {
        // Fallback just in case OTP is turned off
        setAlert({ type: "success", msg: "Account created! Welcome to K2I 🎉" });
        setTimeout(() => navigate("/"), 800);
      }
    } catch (err) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit OTP ──────────────────────────────────────────────────────
  const submitOtp = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });
    if (otp.length !== 6) { setAlert({ type: "error", msg: "Enter the complete 6-digit OTP." }); return; }
    
    setLoading(true);
    try {
      await verifySignupOtp(otpToken, otp);
      setAlert({ type: "success", msg: "Account verified and created! Welcome to K2I 🎉" });
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setAlert({ type: "error", msg: err.message });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setAlert({ type: "", msg: "" });
    try {
      // Use type "signup" for the resend endpoint
      const data = await resendOtp(otpToken, "signup");
      setOtpToken(data.otpToken);
      setCountdown(60);
      setOtp("");
      setAlert({ type: "success", msg: "New OTP sent to your email." });
    } catch (err) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <h1>Knowledg2<br />Intelligence</h1>
          <p>{step === 1 ? "Create your free K2I account" : "Email verification"}</p>
        </div>

        {step === 1 ? (
          <>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join thousands of learners today</p>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: 8 }}>📧</div>
            <h2 className="auth-title">Verify Your Email</h2>
            <p className="auth-subtitle">
              We sent a 6-digit OTP to<br />
              <strong style={{ color: "#47ffeb" }}>{maskedEmail}</strong>
            </p>
          </>
        )}

        {alert.msg && (
          <div className={`auth-alert ${alert.type === "error" ? "auth-alert-error" : "auth-alert-success"}`}>
            {alert.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
            <span>{alert.msg}</span>
          </div>
        )}

        {/* ── Step 1 Form ── */}
        {step === 1 && (
          <form className="auth-form" onSubmit={submit} noValidate>
            {/* Name */}
            <div className="auth-field">
              <label>Full Name <span style={{ color: "#ff9999" }}>*</span></label>
              <div className="auth-input-wrap">
                <FaUser className="auth-icon" />
                <input
                  type="text" name="name" placeholder="Your full name"
                  value={form.name} onChange={handle} disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label>Email Address <span style={{ color: "#ff9999" }}>*</span></label>
              <div className="auth-input-wrap">
                <FaEnvelope className="auth-icon" />
                <input
                  type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handle} autoComplete="email" disabled={loading}
                />
              </div>
            </div>

            {/* Phone (optional) */}
            <div className="auth-field">
              <label>Phone Number <span style={{ color: "rgba(255,248,240,0.35)", fontWeight: 400 }}>(optional)</span></label>
              <div className="auth-input-wrap">
                <FaPhone className="auth-icon" />
                <input
                  type="tel" name="phone" placeholder="+91 XXXXX XXXXX"
                  value={form.phone} onChange={handle} disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label>Password <span style={{ color: "#ff9999" }}>*</span></label>
              <div className="auth-input-wrap">
                <FaLock className="auth-icon" />
                <input
                  type={showPass ? "text" : "password"} name="password"
                  placeholder="Min 8 chars, uppercase + number"
                  value={form.password} onChange={handle} disabled={loading}
                />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {form.password && (
                <div className="pw-strength">
                  <div className="pw-bars">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`pw-bar ${i <= strength.level ? strength.cls : ""}`}
                      />
                    ))}
                  </div>
                  <span className="pw-label">Strength: {strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label>Confirm Password <span style={{ color: "#ff9999" }}>*</span></label>
              <div className="auth-input-wrap">
                <FaLock className="auth-icon" />
                <input
                  type={showConfirm ? "text" : "password"} name="confirm"
                  placeholder="Re-enter your password"
                  value={form.confirm} onChange={handle} disabled={loading}
                  className={form.confirm && form.confirm !== form.password ? "auth-input-error" : ""}
                />
                <button type="button" className="auth-toggle-pass" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <span style={{ color: "#ff9999", fontSize: "0.78rem", marginTop: "2px" }}>
                  Passwords don't match
                </span>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" /> Sending OTP…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        {/* ── Step 2 Form (OTP) ── */}
        {step === 2 && (
          <form className="auth-form" onSubmit={submitOtp} noValidate>
            <div className="auth-field">
              <label style={{ textAlign: "center", display: "block" }}>Enter OTP</label>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <button type="submit" className="auth-btn" disabled={loading || otp.length !== 6}>
              {loading
                ? <span className="auth-btn-loading"><span className="auth-spinner" /> Verifying…</span>
                : "Verify & Create Account"}
            </button>

            <div style={{ textAlign: "center", fontSize: "0.85rem", color: "rgba(255,248,240,0.5)", marginTop: 4 }}>
              {countdown > 0 ? (
                <>Resend OTP in <strong style={{ color: "#47ffeb" }}>{countdown}s</strong></>
              ) : (
                <button type="button" className="auth-link" onClick={handleResend} disabled={loading}>
                  Resend OTP
                </button>
              )}
            </div>

            <button type="button" className="auth-link"
              style={{ textAlign: "center", display: "block", margin: "4px auto 0", fontSize: "0.85rem", color: "rgba(255,248,240,0.45)" }}
              onClick={() => { setStep(1); setOtp(""); setAlert({ type: "", msg: "" }); }}>
              ← Back to signup
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: "22px" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;