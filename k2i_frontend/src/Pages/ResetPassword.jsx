import React, { useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import "../assets/Css/Auth.css";

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

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm]         = useState({ password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState({ type: "", msg: "" });
  const [done, setDone]         = useState(false);

  const strength = getStrength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirm) {
      setAlert({ type: "error", msg: "Please fill in all fields." }); return;
    }
    if (form.password !== form.confirm) {
      setAlert({ type: "error", msg: "Passwords do not match." }); return;
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
      setAlert({ type: "error", msg: "Password must contain an uppercase letter and a number." }); return;
    }
    setLoading(true);
    setAlert({ type: "", msg: "" });
    try {
      await resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-success-icon">✅</div>
          <h2 className="auth-title">Password Reset!</h2>
          <p className="auth-subtitle">Your password has been updated. Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Knowledg2<br />Intelligence</h1>
        </div>
        <div className="auth-success-icon">🔒</div>
        <h2 className="auth-title">Set New Password</h2>
        <p className="auth-subtitle">Choose a strong password for your account</p>

        {alert.msg && (
          <div className={`auth-alert ${alert.type === "error" ? "auth-alert-error" : "auth-alert-success"}`}>
            {alert.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
            <span>{alert.msg}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-field">
            <label>New Password</label>
            <div className="auth-input-wrap">
              <FaLock className="auth-icon" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Min 8 chars, uppercase + number"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
              />
              <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {form.password && (
              <div className="pw-strength">
                <div className="pw-bars">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`pw-bar ${i <= strength.level ? strength.cls : ""}`} />
                  ))}
                </div>
                <span className="pw-label">Strength: {strength.label}</span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label>Confirm New Password</label>
            <div className="auth-input-wrap">
              <FaLock className="auth-icon" />
              <input
                type="password"
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                disabled={loading}
                className={form.confirm && form.confirm !== form.password ? "auth-input-error" : ""}
              />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <span className="auth-btn-loading"><span className="auth-spinner" /> Resetting…</span>
            ) : "Reset Password"}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: "22px" }}>
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
