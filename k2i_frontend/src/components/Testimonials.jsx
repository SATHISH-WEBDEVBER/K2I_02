import React, { useState, useEffect } from "react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Testimonials.css";

const testimonials = [
  {
    name: "Arun Kumar", role: "Engineering Student",
    textEn: "K2I helped me build my first IoT project from scratch. The Tamil explanations made it so much easier to understand!",
    textTa: "K2I என் முதல் IoT திட்டத்தை உருவாக்க உதவியது. தமிழ் விளக்கங்கள் மிகவும் எளிதாக புரிந்தன!",
    avatar: "AK",
  },
  {
    name: "Priya S", role: "B.E. ECE Student",
    textEn: "The project documentation is incredibly detailed. I submitted my mini-project using K2I resources and got full marks!",
    textTa: "திட்ட ஆவணங்கள் மிகவும் விரிவானவை. K2I வளங்களை பயன்படுத்தி மினி-திட்டம் சமர்ப்பித்தேன்!",
    avatar: "PS",
  },
  {
    name: "Vijay R", role: "Self-taught Developer",
    textEn: "As someone who learned programming in Tamil, K2I is the platform I always wished existed. Absolutely amazing!",
    textTa: "தமிழில் நிரலாக்கம் கற்றவனாக, K2I என்னிடம் இல்லாத தளம். அற்புதமானது!",
    avatar: "VR",
  },
  {
    name: "Lakshmi M", role: "Diploma Student",
    textEn: "The step-by-step Arduino tutorials are perfect for beginners. I made my first working project in just one week!",
    textTa: "Arduino பயிற்சிகள் தொடக்கர்களுக்கு சரியானவை. ஒரே வாரத்தில் முதல் திட்டத்தை உருவாக்கினேன்!",
    avatar: "LM",
  },
];

const Testimonials = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="testimonials-section">
      <div className="testimonials-header" data-aos="fade-up">
        <h2 className={language === "ta" ? "tamil-text" : ""}>{t.testimonialsTitle}</h2>
        <p className={language === "ta" ? "tamil-text" : ""}>{t.testimonialsSubtitle}</p>
      </div>
      <div className="testimonials-slider" data-aos="fade-up">
        <div className="testimonial-card">
          <div className="testimonial-avatar">{testimonials[active].avatar}</div>
          <p className={`testimonial-text ${language === "ta" ? "tamil-text" : ""}`}>
            "{language === "ta" ? testimonials[active].textTa : testimonials[active].textEn}"
          </p>
          <div className="testimonial-author">
            <strong>{testimonials[active].name}</strong>
            <span>{testimonials[active].role}</span>
          </div>
          <div className="testimonial-stars">★★★★★</div>
        </div>
        <div className="testimonial-dots">
          {testimonials.map((_, i) => (
            <button key={i} className={`dot ${active === i ? "dot-active" : ""}`} onClick={() => setActive(i)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
