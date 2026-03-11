import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/RecentProjects.css";

const recentData = [
  {
    title: "Smart Home Automation", titleTa: "ஸ்மார்ட் ஹோம் ஆட்டோமேஷன்",
    desc: "Control home appliances remotely using ESP8266 and a web dashboard.",
    descTa: "ESP8266 மூலம் வீட்டு உபகரணங்களை தொலைவிலிருந்து கட்டுப்படுத்துங்கள்.",
    tags: ["IoT", "ESP8266", "HTML"],
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
    github: "https://github.com",
  },
  {
    title: "Line Follower Robot", titleTa: "லைன் ஃபாலோவர் ரோபோ",
    desc: "A self-navigating robot that follows a black line using IR sensors.",
    descTa: "IR சென்சார்கள் மூலம் கருப்பு கோட்டை பின்தொடரும் ரோபோ.",
    tags: ["Arduino", "Embedded", "Robot"],
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
    github: "https://github.com",
  },
  {
    title: "Face Recognition Attendance", titleTa: "முக அங்கீகார வருகை",
    desc: "Automated attendance using OpenCV and Python with CSV logging.",
    descTa: "OpenCV மற்றும் Python மூலம் தானியங்கு வருகை பதிவு.",
    tags: ["Python", "AI", "OpenCV"],
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
    github: "https://github.com",
  },
];

const RecentProjects = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  return (
    <section className="recent-section">
      <div className="recent-header" data-aos="fade-up">
        <h2 className={language === "ta" ? "tamil-text" : ""}>{t.recentTitle}</h2>
        <p className={language === "ta" ? "tamil-text" : ""}>{t.recentSubtitle}</p>
      </div>
      <div className="recent-grid">
        {recentData.map((p, i) => (
          <div className="recent-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
            <div className="recent-card-img">
              <img src={p.gif} alt={language === "ta" ? p.titleTa : p.title} />
            </div>
            <div className="recent-card-body">
              <h3 className={language === "ta" ? "tamil-text" : ""}>{language === "ta" ? p.titleTa : p.title}</h3>
              <p className={language === "ta" ? "tamil-text" : ""}>{language === "ta" ? p.descTa : p.desc}</p>
              <div className="recent-tags">
                {p.tags.map(tag => <span key={tag}>{tag}</span>)}
              </div>
              <div className="recent-actions">
                <a href={p.github} target="_blank" rel="noreferrer" className="recent-btn">
                  <i className="fab fa-github"></i>
                  <span className={language === "ta" ? "tamil-text" : ""}>{t.viewProject}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="recent-viewall" data-aos="fade-up">
        <Link to="/projects" className="shiny-button">
          <span className={language === "ta" ? "tamil-text" : ""}>{t.viewAll}</span>
        </Link>
      </div>
    </section>
  );
};

export default RecentProjects;
