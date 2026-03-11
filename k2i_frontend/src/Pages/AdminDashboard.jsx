import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers, FaBook, FaChartBar, FaSearch, FaTrash,
  FaBan, FaCheckCircle, FaExclamationCircle, FaUpload,
  FaSignOutAlt, FaUserShield, FaHome,
} from "react-icons/fa";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import "../assets/Css/Admin.css";

// ── Confirm dialog ─────────────────────────────────────────────────────────────
const ConfirmDialog = ({ msg, onConfirm, onCancel, danger = false }) => (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <h3>⚠️ Confirm Action</h3>
      <p>{msg}</p>
      <div className="confirm-actions">
        <button className={danger ? "tbl-btn tbl-btn-danger" : "btn-primary"} onClick={onConfirm}>
          Confirm
        </button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, logout, authFetch, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab]         = useState("overview");
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]     = useState({ type: "", msg: "" });
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirm, setConfirm] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

  // ── Upload form state ─────────────────────────────────────────────────────
  const emptyUpload = {
    title: "", titleTa: "", description: "", descriptionTa: "",
    type: "tutorial", category: "embedded", level: "Beginner", duration: "",
    youtubeLink: "", githubLink: "", tags: "",
  };
  const [uploadForm, setUploadForm] = useState(emptyUpload);
  const [videoFile, setVideoFile]   = useState(null);
  const [docFile, setDocFile]       = useState(null);
  const [thumbFile, setThumbFile]   = useState(null);
  const [uploading, setUploading]   = useState(false);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "", msg: "" }), 4000);
  };

  // ── Fetch overview stats ──────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch("/admin/dashboard-stats");
      if (data.success) setStats(data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [authFetch]);

  // ── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("isActive", statusFilter);
      const data = await authFetch(`/admin/users?${params}`);
      if (data.success) setUsers(data.users);
    } catch { /* */ }
    finally { setLoading(false); }
  }, [authFetch, search, roleFilter, statusFilter]);

  // ── Fetch content ─────────────────────────────────────────────────────────
  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch("/admin/content");
      if (data.success) setContent(data.content);
    } catch { /* */ }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => {
    if (tab === "overview") fetchStats();
    else if (tab === "users") fetchUsers();
    else if (tab === "content") fetchContent();
  }, [tab]);

  useEffect(() => {
    if (tab === "users") {
      const t = setTimeout(fetchUsers, 400);
      return () => clearTimeout(t);
    }
  }, [search, roleFilter, statusFilter]);

  // ── Toggle user active ────────────────────────────────────────────────────
  const toggleUserStatus = async (uid, name, isActive) => {
    setConfirm({
      msg: `${isActive ? "Deactivate" : "Activate"} user "${name}"?`,
      danger: isActive,
      onConfirm: async () => {
        setConfirm(null);
        const data = await authFetch(`/admin/users/${uid}/toggle-status`, { method: "PATCH" });
        if (data.success) {
          showAlert("success", data.message);
          fetchUsers();
        } else showAlert("error", data.message);
      },
    });
  };

  // ── Delete user ───────────────────────────────────────────────────────────
  const deleteUser = async (uid, name) => {
    setConfirm({
      msg: `Permanently delete user "${name}"? This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        const data = await authFetch(`/admin/users/${uid}`, { method: "DELETE" });
        if (data.success) {
          showAlert("success", "User deleted.");
          fetchUsers();
        } else showAlert("error", data.message);
      },
    });
  };

  // ── Delete content ────────────────────────────────────────────────────────
  const deleteContent = async (cid, title) => {
    setConfirm({
      msg: `Delete content "${title}"?`,
      danger: true,
      onConfirm: async () => {
        setConfirm(null);
        const data = await authFetch(`/admin/content/${cid}`, { method: "DELETE" });
        if (data.success) {
          showAlert("success", "Content deleted.");
          fetchContent();
        } else showAlert("error", data.message);
      },
    });
  };

  // ── Toggle content publish ────────────────────────────────────────────────
  const togglePublish = async (cid, isPublished) => {
    const data = await authFetch(`/admin/content/${cid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    if (data.success) {
      showAlert("success", isPublished ? "Content unpublished." : "Content published.");
      fetchContent();
    } else showAlert("error", data.message);
  };

  // ── Upload content ────────────────────────────────────────────────────────
  const submitUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.description) {
      showAlert("error", "Title and description are required."); return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(uploadForm).forEach(([k, v]) => fd.append(k, v));
      if (videoFile) fd.append("videoFile", videoFile);
      if (docFile)   fd.append("documentFile", docFile);
      if (thumbFile) fd.append("thumbnailFile", thumbFile);

      const res = await fetch(`${API_BASE}/admin/content`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        showAlert("success", "Content uploaded successfully!");
        setUploadForm(emptyUpload);
        setVideoFile(null); setDocFile(null); setThumbFile(null);
        setTab("content");
        fetchContent();
      } else showAlert("error", data.message);
    } catch (err) {
      showAlert("error", "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  // ── Sidebar items ─────────────────────────────────────────────────────────
  const navItems = [
    { key: "overview", label: "Overview",   icon: <FaChartBar /> },
    { key: "users",    label: "Users",      icon: <FaUsers /> },
    { key: "content",  label: "Content",    icon: <FaBook /> },
    { key: "upload",   label: "Upload",     icon: <FaUpload /> },
  ];

  return (
    <div className="admin-page">
      {/* Top bar */}
      <div className="admin-topbar">
        <div>
          <h1>⚙️ Admin Panel</h1>
          <p>K2I Platform Control Center</p>
        </div>
        <div className="admin-topbar-right">
          <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: "0.82rem" }}
            onClick={() => navigate("/")}>
            <FaHome style={{ marginRight: 6 }} /> Site
          </button>
          <button className="btn-ghost" style={{ padding: "7px 14px", fontSize: "0.82rem", color: "#ff9999", borderColor: "rgba(255,107,107,0.3)" }}
            onClick={() => { logout(); navigate("/"); }}>
            <FaSignOutAlt style={{ marginRight: 6 }} /> Logout
          </button>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          msg={confirm.msg}
          danger={confirm.danger}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          {navItems.map((n) => (
            <div
              key={n.key}
              className={`admin-nav-item ${tab === n.key ? "active" : ""}`}
              onClick={() => setTab(n.key)}
            >
              {n.icon} {n.label}
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "16px 22px", borderTop: "1px solid rgba(71,255,235,0.08)" }}>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,248,240,0.35)" }}>Logged in as</div>
            <div style={{ fontSize: "0.88rem", color: "#47ffeb", fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,248,240,0.35)", marginTop: 2 }}><FaUserShield /> ADMIN</div>
          </div>
        </aside>

        {/* Main */}
        <main className="admin-main">
          {alert.msg && (
            <div className={`admin-alert ${alert.type === "error" ? "admin-alert-error" : "admin-alert-success"}`}>
              {alert.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
              {alert.msg}
            </div>
          )}

          {/* ── OVERVIEW ───────────────────────────────────────────────────── */}
          {tab === "overview" && (
            <>
              {loading ? (
                <div className="admin-loading"><div className="admin-spinner" />Loading stats…</div>
              ) : stats ? (
                <>
                  <div className="stats-grid">
                    {[
                      { icon: "👥", val: stats.stats.totalUsers,       label: "Total Users" },
                      { icon: "✅", val: stats.stats.activeUsers,      label: "Active Users" },
                      { icon: "🚫", val: stats.stats.inactiveUsers,    label: "Inactive Users" },
                      { icon: "🛡️", val: stats.stats.totalAdmins,      label: `Admins (max ${stats.stats.maxAdmins})` },
                      { icon: "📚", val: stats.stats.totalContent,     label: "Total Content" },
                      { icon: "📢", val: stats.stats.publishedContent, label: "Published" },
                    ].map((s) => (
                      <div className="stat-card" key={s.label}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.val}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent users */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div className="admin-card-title"><FaUsers /> Recent Registrations</div>
                    </div>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th></tr>
                        </thead>
                        <tbody>
                          {stats.recentUsers.map((u) => (
                            <tr key={u._id}>
                              <td>{u.name}</td>
                              <td style={{ color: "rgba(255,248,240,0.6)" }}>{u.email}</td>
                              <td>
                                <span className={`badge ${u.isActive ? "badge-active" : "badge-inactive"}`}>
                                  {u.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td style={{ color: "rgba(255,248,240,0.5)" }}>{fmtDate(u.createdAt)}</td>
                            </tr>
                          ))}
                          {stats.recentUsers.length === 0 && (
                            <tr><td colSpan={4} className="admin-empty">No users yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent content */}
                  <div className="admin-card">
                    <div className="admin-card-header">
                      <div className="admin-card-title"><FaBook /> Recent Content</div>
                    </div>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Title</th><th>Type</th><th>Category</th><th>Status</th><th>Added</th></tr>
                        </thead>
                        <tbody>
                          {stats.recentContent.map((c) => (
                            <tr key={c._id}>
                              <td>{c.title}</td>
                              <td><span className={`badge badge-${c.type === "video" ? "video" : c.type === "documentation" ? "doc" : "tut"}`}>{c.type}</span></td>
                              <td style={{ color: "rgba(255,248,240,0.6)" }}>{c.category}</td>
                              <td><span className={`badge ${c.isPublished ? "badge-active" : "badge-inactive"}`}>{c.isPublished ? "Live" : "Draft"}</span></td>
                              <td style={{ color: "rgba(255,248,240,0.5)" }}>{fmtDate(c.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="admin-empty">Could not load stats. Check API connection.</div>
              )}
            </>
          )}

          {/* ── USERS ──────────────────────────────────────────────────────── */}
          {tab === "users" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title"><FaUsers /> User Management</div>
              </div>
              <div className="admin-toolbar">
                <div className="admin-search">
                  <FaSearch className="search-icon" />
                  <input
                    placeholder="Search name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {loading ? (
                <div className="admin-loading"><div className="admin-spinner" />Loading users…</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Email</th><th>Phone</th>
                        <th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td style={{ color: "rgba(255,248,240,0.6)", fontSize: "0.83rem" }}>{u.email}</td>
                          <td style={{ color: "rgba(255,248,240,0.5)", fontSize: "0.83rem" }}>{u.phone || "—"}</td>
                          <td><span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-user"}`}>{u.role}</span></td>
                          <td><span className={`badge ${u.isActive ? "badge-active" : "badge-inactive"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                          <td style={{ color: "rgba(255,248,240,0.5)", fontSize: "0.83rem" }}>{fmtDate(u.createdAt)}</td>
                          <td>
                            <div className="tbl-actions">
                              <button
                                className={`tbl-btn ${u.isActive ? "tbl-btn-warn" : "tbl-btn-success"}`}
                                onClick={() => toggleUserStatus(u._id, u.name, u.isActive)}
                                disabled={u._id === user._id}
                              >
                                {u.isActive ? <><FaBan /> Deactivate</> : <><FaCheckCircle /> Activate</>}
                              </button>
                              <button
                                className="tbl-btn tbl-btn-danger"
                                onClick={() => deleteUser(u._id, u.name)}
                                disabled={u._id === user._id}
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={7} className="admin-empty">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT ────────────────────────────────────────────────────── */}
          {tab === "content" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title"><FaBook /> Content Management</div>
                <button className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                  onClick={() => setTab("upload")}>
                  <FaUpload style={{ marginRight: 6 }} /> Upload New
                </button>
              </div>

              {loading ? (
                <div className="admin-loading"><div className="admin-spinner" />Loading content…</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Title</th><th>Type</th><th>Category</th><th>Level</th><th>Status</th><th>Views</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {content.map((c) => (
                        <tr key={c._id}>
                          <td style={{ fontWeight: 600, maxWidth: 220 }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.title}
                            </div>
                          </td>
                          <td><span className={`badge badge-${c.type === "video" ? "video" : c.type === "documentation" ? "doc" : "tut"}`}>{c.type}</span></td>
                          <td style={{ color: "rgba(255,248,240,0.6)", fontSize: "0.83rem" }}>{c.category}</td>
                          <td style={{ color: "rgba(255,248,240,0.6)", fontSize: "0.83rem" }}>{c.level}</td>
                          <td><span className={`badge ${c.isPublished ? "badge-active" : "badge-inactive"}`}>{c.isPublished ? "Live" : "Draft"}</span></td>
                          <td style={{ color: "rgba(255,248,240,0.5)", fontSize: "0.83rem" }}>{c.views}</td>
                          <td>
                            <div className="tbl-actions">
                              <button
                                className={`tbl-btn ${c.isPublished ? "tbl-btn-warn" : "tbl-btn-success"}`}
                                onClick={() => togglePublish(c._id, c.isPublished)}
                              >
                                {c.isPublished ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                className="tbl-btn tbl-btn-danger"
                                onClick={() => deleteContent(c._id, c.title)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {content.length === 0 && (
                        <tr><td colSpan={7} className="admin-empty">No content yet. Upload something!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── UPLOAD ─────────────────────────────────────────────────────── */}
          {tab === "upload" && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title"><FaUpload /> Upload Content</div>
              </div>
              <form onSubmit={submitUpload} className="upload-form">
                {/* Title EN */}
                <div className="upload-field">
                  <label>Title (English) *</label>
                  <input type="text" placeholder="Content title in English"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} />
                </div>
                {/* Title TA */}
                <div className="upload-field">
                  <label>Title (Tamil)</label>
                  <input type="text" placeholder="தலைப்பு தமிழில்"
                    value={uploadForm.titleTa}
                    onChange={(e) => setUploadForm({ ...uploadForm, titleTa: e.target.value })} />
                </div>
                {/* Type */}
                <div className="upload-field">
                  <label>Content Type *</label>
                  <select value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}>
                    <option value="tutorial">Tutorial</option>
                    <option value="video">Video</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>
                {/* Category */}
                <div className="upload-field">
                  <label>Category *</label>
                  <select value={uploadForm.category} onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}>
                    <option value="embedded">Embedded</option>
                    <option value="iot">IoT</option>
                    <option value="webDev">Web Dev</option>
                    <option value="ai">AI / ML</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {/* Level */}
                <div className="upload-field">
                  <label>Difficulty Level *</label>
                  <select value={uploadForm.level} onChange={(e) => setUploadForm({ ...uploadForm, level: e.target.value })}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                {/* Duration */}
                <div className="upload-field">
                  <label>Duration</label>
                  <input type="text" placeholder="e.g. 45 min, 2hr, Read"
                    value={uploadForm.duration}
                    onChange={(e) => setUploadForm({ ...uploadForm, duration: e.target.value })} />
                </div>
                {/* Description EN */}
                <div className="upload-field full">
                  <label>Description (English) *</label>
                  <textarea rows={3} placeholder="Describe what this content covers…"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} />
                </div>
                {/* Description TA */}
                <div className="upload-field full">
                  <label>Description (Tamil)</label>
                  <textarea rows={3} placeholder="விளக்கம் தமிழில்…"
                    value={uploadForm.descriptionTa}
                    onChange={(e) => setUploadForm({ ...uploadForm, descriptionTa: e.target.value })} />
                </div>
                {/* YouTube */}
                <div className="upload-field">
                  <label>YouTube Link</label>
                  <input type="url" placeholder="https://youtube.com/watch?v=..."
                    value={uploadForm.youtubeLink}
                    onChange={(e) => setUploadForm({ ...uploadForm, youtubeLink: e.target.value })} />
                </div>
                {/* GitHub */}
                <div className="upload-field">
                  <label>GitHub Link</label>
                  <input type="url" placeholder="https://github.com/..."
                    value={uploadForm.githubLink}
                    onChange={(e) => setUploadForm({ ...uploadForm, githubLink: e.target.value })} />
                </div>
                {/* Tags */}
                <div className="upload-field full">
                  <label>Tags (comma-separated)</label>
                  <input type="text" placeholder="arduino, esp8266, iot, beginner"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} />
                </div>

                {/* File uploads */}
                <div className="upload-field">
                  <label>Video File (.mp4, .webm)</label>
                  <label className="file-input-label">
                    <FaUpload />
                    {videoFile ? videoFile.name : "Choose video file (max 500MB)"}
                    <input type="file" accept="video/*" style={{ display: "none" }}
                      onChange={(e) => setVideoFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="upload-field">
                  <label>Document File (.pdf)</label>
                  <label className="file-input-label">
                    <FaUpload />
                    {docFile ? docFile.name : "Choose PDF document"}
                    <input type="file" accept=".pdf" style={{ display: "none" }}
                      onChange={(e) => setDocFile(e.target.files[0])} />
                  </label>
                </div>
                <div className="upload-field full">
                  <label>Thumbnail Image</label>
                  <label className="file-input-label">
                    <FaUpload />
                    {thumbFile ? thumbFile.name : "Choose thumbnail image (optional)"}
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => setThumbFile(e.target.files[0])} />
                  </label>
                </div>

                <div className="upload-field full">
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button type="submit" className="btn-primary" disabled={uploading}>
                      {uploading ? "Uploading…" : "Upload Content"}
                    </button>
                    <button type="button" className="btn-ghost"
                      onClick={() => { setUploadForm(emptyUpload); setVideoFile(null); setDocFile(null); setThumbFile(null); }}>
                      Reset Form
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      {/* Mobile bottom nav */}
      <nav className="admin-mobile-nav">
        <div className="admin-mobile-nav-inner">
          {navItems.map((n) => (
            <button
              key={n.key}
              className={`admin-mobile-nav-item ${tab === n.key ? "active" : ""}`}
              onClick={() => setTab(n.key)}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
      </div>
    </div>
  );
};

export default AdminDashboard;
