import React, { useState } from "react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Newsletter.css";

const Newsletter = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  return (
    <section className="newsletter-section" data-aos="fade-up">
      <div className="newsletter-inner">
        <div className="newsletter-gif">
          <img src="https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif" alt="Newsletter" />
        </div>
        <div className="newsletter-content">
          <h2 className={language === "ta" ? "tamil-text" : ""}>{t.newsletterTitle}</h2>
          <p className={language === "ta" ? "tamil-text" : ""}>{t.newsletterSubtitle}</p>
          {subscribed ? (
            <div className="newsletter-success">
              <i className="fas fa-check-circle"></i>
              <span>You're subscribed! 🎉</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.newsletterPlaceholder}
                required
              />
              <button type="submit" className="shiny-button">
                <span className={language === "ta" ? "tamil-text" : ""}>{t.newsletterBtn}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
