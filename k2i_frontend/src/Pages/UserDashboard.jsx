import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaPhone, FaPen, FaLock,
  FaSignOutAlt, FaCalendarAlt, FaCheckCircle, FaExclamationCircle,
} from "react-icons/fa";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import "../assets/Css/Dashboard.css";

const UserDashboard = () => {
  const { user, logout, updateProfile, authFetch } = useContext(AuthContext);
  const navigate = useNavigate();

  const [editMode, setEditMode]   = useState(false);
  const [cpwMode, setCpwMode]     = useState(false);
  const [alert, setAlert]         = useState({ type: "", msg: "" });
  const [saving, setSaving]       = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const [cpwForm, setCpwForm] = useState({
    currentPassword: "", newPassword: "", confirm: "",
  });

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "", msg: "" }), 4000);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  // ── Update Profile ─────────────────────────────────────────────────────────
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) { showAlert("error", "Name cannot be empty."); return; }
    setSaving(true);
    try {
      await updateProfile({ name: editForm.name, phone: editForm.phone, bio: editForm.bio });
      showAlert("success", "Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const changePassword = async (e) => {
    e.preventDefault();
    if (!cpwForm.currentPassword || !cpwForm.newPassword || !cpwForm.confirm) {
      showAlert("error", "Please fill in all password fields."); return;
    }
    if (cpwForm.newPassword !== cpwForm.confirm) {
      showAlert("error", "New passwords do not match."); return;
    }
    if (cpwForm.newPassword.length < 8) {
      showAlert("error", "New password must be at least 8 characters."); return;
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(cpwForm.newPassword)) {
      showAlert("error", "Password must contain an uppercase letter and a number."); return;
    }
    setSaving(true);
    try {
      const data = await authFetch("/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: cpwForm.currentPassword,
          newPassword: cpwForm.newPassword,
        }),
      });
      if (data.success) {
        showAlert("success", "Password changed successfully!");
        setCpwMode(false);
        setCpwForm({ currentPassword: "", newPassword: "", confirm: "" });
      } else {
        showAlert("error", data.message);
      }
    } catch {
      showAlert("error", "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "—";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="dashboard-page">
      {/* Banner */}
      <div className="dashboard-banner">
        <div className="dashboard-avatar">
          {user?.profilePhoto
            ? <img src={user.profilePhoto} alt="Profile" />
            : initials}
        </div>
        <h2>{user?.name || "User"}</h2>
        <div className="role-badge">{user?.role === "admin" ? "ADMIN" : "MEMBER"}</div>
        <p>{user?.email}</p>
        <div className="joined-chip">
          <FaCalendarAlt /> Joined {fmtDate(user?.createdAt)}
        </div>
      </div>

      <div className="dashboard-container">

        {/* Alert */}
        {alert.msg && (
          <div className={`dash-alert ${alert.type === "error" ? "dash-alert-error" : "dash-alert-success"}`}>
            {alert.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
            {alert.msg}
          </div>
        )}

        {/* ── Profile Info / Edit ─────────────────────────────────────────── */}
        <div className="dash-card">
          <div className="dash-card-title">
            <FaUser /> My Profile
            {!editMode && (
              <button
                className="btn-ghost"
                style={{ marginLeft: "auto", padding: "6px 16px", fontSize: "0.82rem" }}
                onClick={() => {
                  setEditForm({ name: user.name, phone: user.phone || "", bio: user.bio || "" });
                  setEditMode(true);
                  setCpwMode(false);
                }}
              >
                <FaPen style={{ marginRight: 6 }} /> Edit
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="profile-grid">
              <div className="profile-item">
                <label><FaUser style={{ marginRight: 4 }} /> Full Name</label>
                <span>{user?.name || <span className="empty">Not set</span>}</span>
              </div>
              <div className="profile-item">
                <label><FaEnvelope style={{ marginRight: 4 }} /> Email</label>
                <span>{user?.email}</span>
              </div>
              <div className="profile-item">
                <label><FaPhone style={{ marginRight: 4 }} /> Phone</label>
                <span>{user?.phone || <span className="empty">Not provided</span>}</span>
              </div>
              <div className="profile-item">
                <label>Account Status</label>
                <span style={{ color: user?.isActive ? "#47ffeb" : "#ff6b6b" }}>
                  {user?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="profile-item" style={{ gridColumn: "1/-1" }}>
                <label>Bio</label>
                <span>{user?.bio || <span className="empty">No bio added</span>}</span>
              </div>
              <div className="profile-item">
                <label>Last Login</label>
                <span>{fmtDate(user?.lastLogin)}</span>
              </div>
            </div>
          ) : (
            <form className="edit-form" onSubmit={saveProfile}>
              <div className="edit-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="edit-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="edit-field">
                <label>Bio (max 200 chars)</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us a little about yourself…"
                  maxLength={200}
                />
              </div>
              <div className="edit-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Change Password ─────────────────────────────────────────────── */}
        <div className="dash-card">
          <div className="dash-card-title">
            <FaLock /> Security
            {!cpwMode && (
              <button
                className="btn-ghost"
                style={{ marginLeft: "auto", padding: "6px 16px", fontSize: "0.82rem" }}
                onClick={() => { setCpwMode(true); setEditMode(false); }}
              >
                Change Password
              </button>
            )}
          </div>
          {!cpwMode ? (
            <p style={{ color: "rgba(255,248,240,0.5)", fontSize: "0.9rem" }}>
              Manage your password and account security settings.
            </p>
          ) : (
            <form className="cpw-form" onSubmit={changePassword}>
              {[
                { label: "Current Password", key: "currentPassword" },
                { label: "New Password", key: "newPassword" },
                { label: "Confirm New Password", key: "confirm" },
              ].map(({ label, key }) => (
                <div className="edit-field" key={key}>
                  <label>{label}</label>
                  <div className="cpw-input-wrap">
                    <input
                      type="password"
                      value={cpwForm[key]}
                      onChange={(e) => setCpwForm({ ...cpwForm, [key]: e.target.value })}
                      placeholder={label}
                    />
                  </div>
                </div>
              ))}
              <div className="edit-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Updating…" : "Update Password"}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setCpwMode(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Sign Out ────────────────────────────────────────────────────── */}
        <div className="dash-card" style={{ textAlign: "center", padding: "20px" }}>
          <button className="btn-danger" onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: 8 }} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
