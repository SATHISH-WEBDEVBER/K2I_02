import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Footer.css";

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2 className="footer-logo">K2I</h2>
          <p className="footer-tagline">{t.footerTagline}</p>
          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noreferrer" title="GitHub"><i className="fab fa-github"></i></a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" title="YouTube"><i className="fab fa-youtube"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" title="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="mailto:k2i@example.com" title="Email"><i className="fas fa-envelope"></i></a>
          </div>
        </div>

        <div className="footer-links-group">
          <h4>{t.footerQuickLinks}</h4>
          <ul>
            <li><Link to="/">{t.home}</Link></li>
            <li><Link to="/projects">{t.projects}</Link></li>
            <li><Link to="/learning">{t.documents}</Link></li>
            <li><Link to="/about">{t.about}</Link></li>
            <li><Link to="/contact">{t.contact}</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>{t.footerResources}</h4>
          <ul>
            <li><a href="https://github.com" target="_blank" rel="noreferrer">{t.footerGithub}</a></li>
            <li><a href="https://youtube.com" target="_blank" rel="noreferrer">{t.footerYoutube}</a></li>
            <li><a href="mailto:k2i@example.com">{t.footerEmail}</a></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>{t.footerContact}</h4>
          <ul>
            <li><a href="mailto:k2i@example.com">k2i@example.com</a></li>
            <li><span>Tamil Nadu, India</span></li>
            <li><a href="https://github.com/k2i" target="_blank" rel="noreferrer">github.com/k2i</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t.footerRights}</p>
      </div>
    </footer>
  );
};

export default Footer;
