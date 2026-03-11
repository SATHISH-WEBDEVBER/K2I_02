import React, { useState } from "react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Contact.css";

const Contact = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
  ];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <section className="contact-hero" data-aos="fade-up">
        <div className="contact-hero-gif">
          <img
            src="https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif"
            alt="Contact"
          />
        </div>
        <div>
          <h1 className={language === "ta" ? "tamil-text" : ""}>
            {t.discussTitle}
          </h1>
          <p className={language === "ta" ? "tamil-text" : ""}>
            {t.discussSubtitle}
          </p>
        </div>
      </section>

      <section className="contact-main">
        {/* Form */}
        <div className="contact-form-card" data-aos="fade-right">
          {submitted ? (
            <div className="contact-success">
              <i className="fas fa-check-circle"></i>
              <p className={language === "ta" ? "tamil-text" : ""}>
                {t.formSuccess}
              </p>
              <button onClick={() => setSubmitted(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className={language === "ta" ? "tamil-text" : ""}>
                {t.discussSend}
              </h2>
              <div className="form-row">
                <div className="form-group">
                  <label className={language === "ta" ? "tamil-text" : ""}>
                    {t.discussName}
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder={t.discussName}
                  />
                </div>
                <div className="form-group">
                  <label className={language === "ta" ? "tamil-text" : ""}>
                    {t.discussEmail}
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder={t.discussEmail}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className={language === "ta" ? "tamil-text" : ""}>
                  {t.discussSubjectLabel}
                </label>
                <input
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder={t.discussSubjectLabel}
                />
              </div>
              <div className="form-group">
                <label className={language === "ta" ? "tamil-text" : ""}>
                  {t.discussMessage}
                </label>
                <textarea
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  required
                  placeholder={t.discussMessage}
                ></textarea>
              </div>
              <button type="submit" className="contact-submit-btn">
                <i className="fas fa-paper-plane"></i>
                <span className={language === "ta" ? "tamil-text" : ""}>
                  {t.discussSend}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Connect Info */}
        <div className="contact-info-section" data-aos="fade-left">
          <h2 className={language === "ta" ? "tamil-text" : ""}>
            {t.discussConnect}
          </h2>
          <div className="contact-info-cards">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="info-card"
            >
              <i className="fab fa-github"></i>
              <div>
                <h4>GitHub</h4>
                <p>github.com/k2i</p>
              </div>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="info-card"
            >
              <i className="fab fa-youtube"></i>
              <div>
                <h4>YouTube</h4>
                <p>youtube.com/@k2i</p>
              </div>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="info-card"
            >
              <i className="fab fa-instagram"></i>
              <div>
                <h4>Instagram</h4>
                <p>@k2i_official</p>
              </div>
            </a>
            <a href="mailto:k2i@example.com" className="info-card">
              <i className="fas fa-envelope"></i>
              <div>
                <h4>Email</h4>
                <p>k2i@example.com</p>
              </div>
            </a>
          </div>

          <div className="contact-gif-box">
            <img
              src="https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif"
              alt="Connect"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <h2
          data-aos="fade-up"
          className={language === "ta" ? "tamil-text" : ""}
        >
          {t.faqTitle}
        </h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div
              className={`faq-item ${openFaq === i ? "faq-open" : ""}`}
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 80}
            >
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className={language === "ta" ? "tamil-text" : ""}>
                  {faq.q}
                </span>
                <i
                  className={`fas fa-chevron-${openFaq === i ? "up" : "down"}`}
                ></i>
              </button>
              {openFaq === i && (
                <div className="faq-answer">
                  <p className={language === "ta" ? "tamil-text" : ""}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;
