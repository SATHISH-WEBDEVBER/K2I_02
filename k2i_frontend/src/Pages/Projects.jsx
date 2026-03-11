import React, { useState } from "react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Projects.css";

const projectsData = [
  {
    id: 1, category: "iot", difficulty: "beginner",
    title: "Smart Home Automation", titleTa: "ஸ்மார்ட் ஹோம் ஆட்டோமேஷன்",
    desc: "Control home appliances remotely using ESP8266 and a web dashboard. Includes relay switching, sensor monitoring, and mobile app.",
    descTa: "ESP8266 மற்றும் வலை டாஷ்போர்டு மூலம் வீட்டு உபகரணங்களை தொலைவிலிருந்து கட்டுப்படுத்துங்கள்.",
    tags: ["ESP8266", "NodeMCU", "HTML", "CSS"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    id: 2, category: "embedded", difficulty: "intermediate",
    title: "Arduino Line Follower Robot", titleTa: "அர்டுயினோ லைன் ஃபாலோவர் ரோபோ",
    desc: "Build a robot that follows a black line using IR sensors and Arduino Uno. Includes PID control and motor driver circuit.",
    descTa: "IR சென்சார்கள் மற்றும் Arduino Uno மூலம் கருப்பு கோட்டை பின்தொடரும் ரோபோவை உருவாக்குங்கள்.",
    tags: ["Arduino", "IR Sensor", "PID", "L298N"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    id: 3, category: "webDev", difficulty: "beginner",
    title: "Student Portfolio Website", titleTa: "மாணவர் போர்ட்ஃபோலியோ இணையதளம்",
    desc: "Create a professional portfolio website using HTML, CSS, and JavaScript with animations and responsive design.",
    descTa: "HTML, CSS மற்றும் JavaScript மூலம் தொழில்முறை போர்ட்ஃபோலியோ இணையதளம் உருவாக்குங்கள்.",
    tags: ["HTML", "CSS", "JavaScript", "Responsive"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    id: 4, category: "iot", difficulty: "intermediate",
    title: "Weather Monitoring Station", titleTa: "வானிலை கண்காணிப்பு நிலையம்",
    desc: "Real-time temperature, humidity, and air quality monitoring using DHT22 and MQ sensors with cloud data logging.",
    descTa: "DHT22 மற்றும் MQ சென்சார்கள் மூலம் நேரடி வானிலை கண்காணிப்பு மற்றும் கிளவுட் டேட்டா.",
    tags: ["ESP32", "DHT22", "MQTT", "ThingSpeak"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    id: 5, category: "ai", difficulty: "advanced",
    title: "Face Recognition Attendance", titleTa: "முக அங்கீகார வருகை பதிவு",
    desc: "Automated attendance system using OpenCV and face recognition. Logs attendance to CSV with timestamp and confidence score.",
    descTa: "OpenCV மற்றும் முக அங்கீகாரம் மூலம் தானியங்கு வருகை பதிவு அமைப்பு.",
    tags: ["Python", "OpenCV", "face_recognition", "CSV"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    id: 6, category: "embedded", difficulty: "beginner",
    title: "Digital Clock with RTC", titleTa: "RTC உடன் டிஜிட்டல் கடிகாரம்",
    desc: "Build a digital clock display using DS3231 RTC module and a 7-segment or OLED display with alarm functionality.",
    descTa: "DS3231 RTC மாட்யூல் மற்றும் OLED டிஸ்ப்ளே மூலம் டிஜிட்டல் கடிகாரம் உருவாக்குங்கள்.",
    tags: ["Arduino", "DS3231", "OLED", "I2C"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    id: 7, category: "webDev", difficulty: "intermediate",
    title: "React Todo App with Firebase", titleTa: "Firebase உடன் React Todo App",
    desc: "Full-stack todo application with real-time sync, user authentication, and CRUD operations using React and Firebase.",
    descTa: "React மற்றும் Firebase மூலம் நேரடி ஒத்திசைவு மற்றும் CRUD செயல்பாடுகளுடன் Todo app.",
    tags: ["React", "Firebase", "Auth", "Firestore"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    id: 8, category: "ai", difficulty: "intermediate",
    title: "Plant Disease Detection", titleTa: "தாவர நோய் கண்டறிதல்",
    desc: "Detect plant diseases from leaf images using a CNN model trained on the PlantVillage dataset. Includes a simple web interface.",
    descTa: "CNN மாடல் மூலம் இலை படங்களிலிருந்து தாவர நோய்களை கண்டறியுங்கள்.",
    tags: ["Python", "TensorFlow", "CNN", "Flask"],
    github: "https://github.com", youtube: "https://youtube.com", docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
];

const Projects = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["all", "iot", "embedded", "webDev", "ai"];
  const catLabels = { all: t.allCategories, iot: t.iot, embedded: t.embedded, webDev: t.webDev, ai: t.ai };
  const diffLabels = { beginner: t.beginner, intermediate: t.intermediate, advanced: t.advanced };
  const diffColors = { beginner: "#14655b", intermediate: "#d97706", advanced: "#dc2626" };

  const filtered = projectsData.filter(p => {
    const matchCat = activeFilter === "all" || p.category === activeFilter;
    const titleToSearch = language === "ta" ? p.titleTa : p.title;
    const matchSearch = titleToSearch.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="projects-page">
      {/* Hero */}
      <section className="projects-hero">
        <div className="projects-hero-content" data-aos="fade-up">
          <div className="projects-hero-gif">
            <img src="https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif" alt="Projects" />
          </div>
          <div className="projects-hero-text">
            <h1 className={language === "ta" ? "tamil-text" : ""}>{t.projectsHeroTitle}</h1>
            <p className={language === "ta" ? "tamil-text" : ""}>{t.projectsHeroSub}</p>
            <div className="projects-hero-stats">
              <div className="ph-stat"><span>8+</span><p>{t.statsProjects}</p></div>
              <div className="ph-stat"><span>3</span><p>{t.statsLanguages}</p></div>
              <div className="ph-stat"><span>100%</span><p>Free</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="projects-filter-section">
        <div className="filter-controls">
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeFilter === cat ? "filter-btn-active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                <span className={language === "ta" ? "tamil-text" : ""}>{catLabels[cat]}</span>
              </button>
            ))}
          </div>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={language === "ta" ? "tamil-text" : ""}
            />
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects-grid-section">
        <div className="projects-grid">
          {filtered.map((project, i) => (
            <div className="project-card" key={project.id} data-aos="fade-up" data-aos-delay={i * 80}>
              <div className="project-card-image">
                <img src={project.gif} alt={language === "ta" ? project.titleTa : project.title} />
                <div className="project-difficulty" style={{ backgroundColor: diffColors[project.difficulty] }}>
                  {diffLabels[project.difficulty]}
                </div>
                <div className="project-category-badge">{catLabels[project.category]}</div>
              </div>
              <div className="project-card-body">
                <h3 className={language === "ta" ? "tamil-text" : ""}>
                  {language === "ta" ? project.titleTa : project.title}
                </h3>
                <p className={language === "ta" ? "tamil-text" : ""}>
                  {language === "ta" ? project.descTa : project.desc}
                </p>
                <div className="project-tags">
                  {project.tags.map(tag => <span key={tag} className="project-tag">{tag}</span>)}
                </div>
                <div className="project-actions">
                  <a href={project.docs} className="proj-btn proj-btn-primary">
                    <i className="fas fa-file-alt"></i>
                    <span className={language === "ta" ? "tamil-text" : ""}>{t.projectDocs}</span>
                  </a>
                  <a href={project.github} target="_blank" rel="noreferrer" className="proj-btn proj-btn-secondary">
                    <i className="fab fa-github"></i>
                    <span className={language === "ta" ? "tamil-text" : ""}>{t.projectCode}</span>
                  </a>
                  <a href={project.youtube} target="_blank" rel="noreferrer" className="proj-btn proj-btn-video">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="no-results">
            <p>No projects found. Try a different filter.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Projects;
