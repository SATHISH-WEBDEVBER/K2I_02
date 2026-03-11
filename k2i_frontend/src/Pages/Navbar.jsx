import React, { useState, useEffect, useContext, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaCog, FaGlobe } from "react-icons/fa";
import { translations } from "../Contexts/translations.js";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import "../assets/Css/Navbar.css";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [userMenu, setUserMenu]     = useState(false);

  const { language, toggleLanguage } = useLanguage();
  const t = translations[language] || translations.en;
  const { isAuthenticated, isAdmin, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const closeAll = () => { setDrawerOpen(false); setUserMenu(false); };

  const handleLogout = () => { logout(); navigate("/"); closeAll(); };

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const navLinks = [
    { to: "/",        label: t.home },
    { to: "/projects",label: t.projects },
    { to: "/learning",label: t.documents },
    { to: "/about",   label: t.about },
    { to: "/contact", label: t.contact },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">

          {/* Logo */}
          <div className="logo" onClick={() => { navigate("/"); closeAll(); }}>
            K2I
          </div>

          {/* Desktop nav links */}
          <ul className="nav-menu">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                >
                  <span className={language === "ta" ? "tamil-text" : ""}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop right section */}
          <div className="nav-right">
            {!isAuthenticated ? (
              <>
                <NavLink to="/login"  className="nav-login-btn">Login</NavLink>
                <NavLink to="/signup" className="nav-signup-btn">Sign Up</NavLink>
              </>
            ) : (
              <div className="nav-user-item" ref={dropdownRef}>
                <button className="nav-user-btn" onClick={() => setUserMenu(!userMenu)}>
                  <div className="nav-avatar">{initials}</div>
                  <span className="nav-user-name">{user?.name?.split(" ")[0]}</span>
                </button>

                {userMenu && (
                  <div className="nav-user-dropdown">
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-name">{user?.name}</div>
                      <div className="nav-dropdown-email">{user?.email}</div>
                    </div>
                    {isAdmin && (
                      <button className="nav-dropdown-item" onClick={() => { navigate("/admin"); closeAll(); }}>
                        <FaCog /> Admin Panel
                      </button>
                    )}
                    <button className="nav-dropdown-item" onClick={() => { navigate("/dashboard"); closeAll(); }}>
                      <FaUser /> My Profile
                    </button>
                    <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            className={`menu-icon ${drawerOpen ? "open" : ""}`}
            onClick={() => { setDrawerOpen(!drawerOpen); setUserMenu(false); }}
            aria-label="Toggle menu"
          >
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>

        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`nav-drawer ${drawerOpen ? "open" : ""}`}>

        {/* User info strip */}
        {isAuthenticated && (
          <div className="nav-drawer-user">
            <div className="nav-avatar" style={{ width: 40, height: 40, fontSize: "0.9rem" }}>{initials}</div>
            <div className="nav-drawer-user-info">
              <div className="d-name">{user?.name}</div>
              <div className="d-email">{user?.email}</div>
            </div>
          </div>
        )}

        {/* Nav links */}
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-drawer-link${isActive ? " active" : ""}`}
            onClick={closeAll}
          >
            <span className={language === "ta" ? "tamil-text" : ""}>{label}</span>
          </NavLink>
        ))}

        <div className="nav-drawer-divider" />

        {/* Auth actions */}
        <div className="nav-drawer-auth">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login"  className="nav-drawer-btn nav-drawer-btn-outline" onClick={closeAll}>Login</NavLink>
              <NavLink to="/signup" className="nav-drawer-btn nav-drawer-btn-solid"   onClick={closeAll}>Sign Up</NavLink>
            </>
          ) : (
            <>
              {isAdmin && (
                <button className="nav-drawer-btn nav-drawer-btn-ghost" onClick={() => { navigate("/admin"); closeAll(); }}>
                  ⚙️ Admin Panel
                </button>
              )}
              <button className="nav-drawer-btn nav-drawer-btn-ghost" onClick={() => { navigate("/dashboard"); closeAll(); }}>
                👤 My Profile
              </button>
              <button className="nav-drawer-btn nav-drawer-btn-red" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Floating Language Toggle ── */}
      <button className="lang-float-btn" onClick={toggleLanguage} title="Switch language">
        <FaGlobe className="lang-globe" />
        {language === "en" ? "தமிழ்" : "English"}
      </button>
    </>
  );
};

export default Navbar;
