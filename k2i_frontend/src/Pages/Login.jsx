import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaExclamationCircle, FaCheckCircle, FaShieldAlt,
} from "react-icons/fa";
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

// ── Main Login ─────────────────────────────────────────────────────────────────
const Login = () => {
  const { login, verifyLoginOtp, resendOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  // Step 1 state
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  // OTP step state
  const [step, setStep]           = useState(1); // 1 = credentials, 2 = OTP
  const [otpToken, setOtpToken]   = useState("");
  const [maskedEmail, setMasked]  = useState("");
  const [otp, setOtp]             = useState("");
  const [countdown, setCountdown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState({ type: "", msg: "" });

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const showAlert = (type, msg) => setAlert({ type, msg });
  const clearAlert = () => setAlert({ type: "", msg: "" });

  // ── Step 1: submit email + password ────────────────────────────────────────
  const submitCredentials = async (e) => {
    e.preventDefault();
    clearAlert();
    if (!form.email || !form.password) { showAlert("error", "Please fill in all fields."); return; }
    setLoading(true);
    try {
      const data = await login(form.email.trim(), form.password);
      if (data.requireOtp) {
        setOtpToken(data.otpToken);
        setMasked(data.maskedEmail);
        setCountdown(60);
        setStep(2);
      }
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: submit OTP ──────────────────────────────────────────────────────
  const submitOtp = async (e) => {
    e.preventDefault();
    clearAlert();
    if (otp.length !== 6) { showAlert("error", "Enter the complete 6-digit OTP."); return; }
    setLoading(true);
    try {
      await verifyLoginOtp(otpToken, otp);
      showAlert("success", "Login successful! Welcome back 👋");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      showAlert("error", err.message);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    clearAlert();
    try {
      const data = await resendOtp(otpToken, "login");
      setOtpToken(data.otpToken);
      setCountdown(60);
      setOtp("");
      showAlert("success", "New OTP sent to your email.");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Knowledg2<br />Intelligence</h1>
          <p>{step === 1 ? "Sign in to access your learning hub" : "Email verification"}</p>
        </div>

        {step === 1 ? (
          <>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Enter your credentials to continue</p>
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

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form className="auth-form" onSubmit={submitCredentials} noValidate>
            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrap">
                <FaEnvelope className="auth-icon" />
                <input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  autoComplete="email" disabled={loading} />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <FaLock className="auth-icon" />
                <input type={showPass ? "text" : "password"} name="password"
                  placeholder="Enter your password"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  autoComplete="current-password" disabled={loading} />
                <button type="button" className="auth-toggle-pass"
                  onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <span />
              <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading
                ? <span className="auth-btn-loading"><span className="auth-spinner" /> Sending OTP…</span>
                : <><FaShieldAlt style={{marginRight:6}}/> Continue</>}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <form className="auth-form" onSubmit={submitOtp} noValidate>
            <div className="auth-field">
              <label style={{ textAlign: "center", display: "block" }}>Enter OTP</label>
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />
            </div>

            <button type="submit" className="auth-btn" disabled={loading || otp.length !== 6}>
              {loading
                ? <span className="auth-btn-loading"><span className="auth-spinner" /> Verifying…</span>
                : "Verify & Login"}
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
              onClick={() => { setStep(1); setOtp(""); clearAlert(); }}>
              ← Back to login
            </button>
          </form>
        )}

        <p className="auth-footer" style={{ marginTop: 22 }}>
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
