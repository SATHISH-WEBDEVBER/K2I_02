import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../Contexts/AuthContext.jsx"; 
import "../assets/Css/Auth.css";

// ── 6-box OTP input ────────────────────────────────────────────────────────────
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

// ── Main Forgot Password Page ──────────────────────────────────────────────────
const ForgotPassword = () => {
  const { forgotPassword, verifyForgotOtp, resendOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otpToken, setOtpToken] = useState("");
  const [maskedEmail, setMasked] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", msg: "" });

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const submitEmail = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });
    if (!email) { setAlert({ type: "error", msg: "Please enter your email." }); return; }
    
    setLoading(true);
    try {
      const data = await forgotPassword(email.trim());
      if (data.requireOtp && data.otpToken) {
        setOtpToken(data.otpToken);
        setMasked(data.maskedEmail);
        setCountdown(60);
        setStep(2);
      } else {
        setAlert({ type: "success", msg: data.message });
      }
    } catch (err) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setAlert({ type: "", msg: "" });
    if (otp.length !== 6) { setAlert({ type: "error", msg: "Enter the complete 6-digit OTP." }); return; }
    
    setLoading(true);
    try {
      const data = await verifyForgotOtp(otpToken, otp);
      setAlert({ type: "success", msg: "OTP verified! Redirecting..." });
      // Send them to the reset password page with the secure token
      setTimeout(() => navigate(`/reset-password/${data.resetToken}`), 800);
    } catch (err) {
      setAlert({ type: "error", msg: err.message });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setAlert({ type: "", msg: "" });
    try {
      const data = await resendOtp(otpToken, "forgot");
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
        <div className="auth-logo">
          <h1>Knowledg2<br />Intelligence</h1>
          <p>{step === 1 ? "Account Recovery" : "Email verification"}</p>
        </div>

        {step === 1 ? (
          <>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">Enter your email to receive a reset code</p>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: 8 }}>📧</div>
            <h2 className="auth-title">Verify Your Email</h2>
            <p className="auth-subtitle">
              We sent a 6-digit OTP to<br />
              <strong style={{ color: "#47ffeb" }}>{maskedEmail || email}</strong>
            </p>
          </>
        )}

        {alert.msg && (
          <div className={`auth-alert ${alert.type === "error" ? "auth-alert-error" : "auth-alert-success"}`}>
            {alert.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
            <span>{alert.msg}</span>
          </div>
        )}

        {/* ── Step 1: Email Form ── */}
        {step === 1 && (
          <form className="auth-form" onSubmit={submitEmail} noValidate>
            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <FaEnvelope className="auth-icon" />
                <input type="email" name="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" disabled={loading} />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-btn-loading"><span className="auth-spinner" /> Sending OTP…</span> : "Send Reset Code"}
            </button>

            <p className="auth-footer" style={{ marginTop: 22 }}>
              Remembered your password? <Link to="/login">Sign in</Link>
            </p>
          </form>
        )}

        {/* ── Step 2: OTP Form ── */}
        {step === 2 && (
          <form className="auth-form" onSubmit={submitOtp} noValidate>
            <div className="auth-field">
              <label style={{ textAlign: "center", display: "block" }}>Enter OTP</label>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <button type="submit" className="auth-btn" disabled={loading || otp.length !== 6}>
              {loading ? <span className="auth-btn-loading"><span className="auth-spinner" /> Verifying…</span> : "Verify OTP"}
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
              onClick={() => { setStep(1); setOtp(""); setAlert({type:"", msg:""}); }}>
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;