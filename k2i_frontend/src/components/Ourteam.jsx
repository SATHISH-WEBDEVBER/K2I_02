import React from "react";
import "../assets/Css/Ourteam.css";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import image from "../assets/Images/img.png";

const OurteamData = [
  { name: "Immanuel S", role: "Visual Designer", imgUrl: image, email: "mailto:k2i@example.com", twitter: "#", linkedin: "https://linkedin.com", github: "https://github.com" },
  { name: "Meganadhan", role: "Frontend Developer", imgUrl: image, email: "mailto:k2i@example.com", twitter: "#", linkedin: "https://linkedin.com", github: "https://github.com" },
  { name: "Sathish", role: "Backend Developer", imgUrl: image, email: "mailto:k2i@example.com", twitter: "#", linkedin: "https://linkedin.com", github: "https://github.com" },
  { name: "Julia Park", role: "UI/UX Designer", imgUrl: image, email: "mailto:k2i@example.com", twitter: "#", linkedin: "https://linkedin.com", github: "https://github.com" },
];

const Ourteam = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <section className="team-section">
      <p className="team-subtitle" data-aos="fade-up">{t.teamSubtitle}</p>
      <h2 className="team-title" data-aos="fade-up">{t.teamTitle}</h2>
      <div className="team-grid">
        {OurteamData.map((member, index) => (
          <div className="team-card" key={index} data-aos="fade-up" data-aos-delay={index * 80}>
            <div className="team-image">
              <img src={member.imgUrl || image} alt={member.name} />
            </div>
            <h3 className="team-name">{member.name}</h3>
            <p className="team-role">{member.role}</p>
            <div className="team-socials">
              <a href={member.email}><i className="fas fa-envelope"></i></a>
              <a href={member.twitter}><i className="fab fa-twitter"></i></a>
              <a href={member.linkedin}><i className="fab fa-linkedin-in"></i></a>
              <a href={member.github}><i className="fab fa-github"></i></a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Ourteam;
