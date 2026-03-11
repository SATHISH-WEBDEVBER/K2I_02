import React from "react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import { IconUsersGroup, IconBulb, IconCode, IconHeart } from "@tabler/icons-react";
import "../assets/Css/About.css";
import imgPlaceholder from "../assets/Images/img.png";

const About = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const teamMembers = [
    { name: "Immanuel S", role: "Visual Designer", img: imgPlaceholder, github: "https://github.com", linkedin: "https://linkedin.com", email: "mailto:k2i@example.com" },
    { name: "Meganadhan", role: "Frontend Developer", img: imgPlaceholder, github: "https://github.com", linkedin: "https://linkedin.com", email: "mailto:k2i@example.com" },
    { name: "Sathish", role: "Backend Developer", img: imgPlaceholder, github: "https://github.com", linkedin: "https://linkedin.com", email: "mailto:k2i@example.com" },
    { name: "Julia Park", role: "UI/UX Designer", img: imgPlaceholder, github: "https://github.com", linkedin: "https://linkedin.com", email: "mailto:k2i@example.com" },
  ];

  const values = [
    { icon: <IconBulb size={28} />, key: "value1" },
    { icon: <IconCode size={28} />, key: "value2" },
    { icon: <IconUsersGroup size={28} />, key: "value3" },
    { icon: <IconHeart size={28} />, key: "value4" },
  ];

  const milestones = [
    { year: "2023", titleKey: "milestone1Title", descKey: "milestone1Desc" },
    { year: "2023", titleKey: "milestone2Title", descKey: "milestone2Desc" },
    { year: "2024", titleKey: "milestone3Title", descKey: "milestone3Desc" },
    { year: "2025", titleKey: "milestone4Title", descKey: "milestone4Desc" },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-content" data-aos="fade-up">
          <div className="about-hero-gif">
            <img src="https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif" alt="About K2I" />
          </div>
          <div className="about-hero-text">
            <h1 className={language === "ta" ? "tamil-text" : ""}>{t.aboutHeroTitle}</h1>
            <p className={language === "ta" ? "tamil-text" : ""}>{t.aboutHeroSub}</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision-section">
        <div className="mv-card" data-aos="fade-right">
          <div className="mv-icon"><i className="fas fa-bullseye"></i></div>
          <h2 className={language === "ta" ? "tamil-text" : ""}>{t.ourMission}</h2>
          <p className={language === "ta" ? "tamil-text" : ""}>{t.missionText}</p>
        </div>
        <div className="mv-divider">
          <img src="https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif" alt="K2I" className="mv-center-gif" />
        </div>
        <div className="mv-card" data-aos="fade-left">
          <div className="mv-icon"><i className="fas fa-eye"></i></div>
          <h2 className={language === "ta" ? "tamil-text" : ""}>{t.ourVision}</h2>
          <p className={language === "ta" ? "tamil-text" : ""}>{t.visionText}</p>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <h2 data-aos="fade-up" className={language === "ta" ? "tamil-text" : ""}>{t.ourValues}</h2>
        <div className="values-grid">
          {values.map((v, i) => (
            <div className="value-card" key={i} data-aos="zoom-in" data-aos-delay={i * 100}>
              <div className="value-icon">{v.icon}</div>
              <h3 className={language === "ta" ? "tamil-text" : ""}>{t[v.key]}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <h2 data-aos="fade-up" className={language === "ta" ? "tamil-text" : ""}>{t.milestoneTitle}</h2>
        <div className="timeline">
          {milestones.map((m, i) => (
            <div className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`} key={i} data-aos={i % 2 === 0 ? "fade-right" : "fade-left"}>
              <div className="timeline-content">
                <div className="timeline-year">{m.year}</div>
                <h3 className={language === "ta" ? "tamil-text" : ""}>{t[m.titleKey]}</h3>
                <p className={language === "ta" ? "tamil-text" : ""}>{t[m.descKey]}</p>
              </div>
            </div>
          ))}
          <div className="timeline-line"></div>
        </div>
      </section>

      {/* Team */}
      <section className="about-team-section">
        <p className="team-subtitle" data-aos="fade-up">{t.teamSubtitle}</p>
        <h2 className="team-title" data-aos="fade-up">{t.teamTitle}</h2>
        <div className="about-team-grid">
          {teamMembers.map((member, i) => (
            <div className="about-team-card" key={i} data-aos="fade-up" data-aos-delay={i * 80}>
              <div className="about-team-img">
                <img src={member.img} alt={member.name} />
              </div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
              <div className="about-team-socials">
                <a href={member.email}><i className="fas fa-envelope"></i></a>
                <a href={member.linkedin} target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></a>
                <a href={member.github} target="_blank" rel="noreferrer"><i className="fab fa-github"></i></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="join-team-section" data-aos="fade-up">
        <div className="join-team-inner">
          <h2 className={language === "ta" ? "tamil-text" : ""}>{t.joinTeam}</h2>
          <p className={language === "ta" ? "tamil-text" : ""}>{t.joinTeamText}</p>
          <a href="/contact" className="join-btn">{t.applyNow}</a>
        </div>
      </section>
    </div>
  );
};

export default About;
