import React, { useState, useEffect } from "react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Learning.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

const learningData = [
  {
    id: 1,
    type: "tutorial",
    category: "embedded",
    title: "Getting Started with Arduino",
    titleTa: "Arduino இல் தொடங்குவது எப்படி",
    desc: "A complete beginner's guide to Arduino programming — from LED blinking to sensor interfacing.",
    descTa:
      "Arduino நிரலாக்கத்திற்கான முழுமையான தொடக்க வழிகாட்டி — LED தொடக்கம் முதல் சென்சார் வரை.",
    duration: "45 min",
    level: "Beginner",
    youtube: "https://youtube.com",
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    id: 2,
    type: "video",
    category: "iot",
    title: "ESP8266 WiFi Module Complete Guide",
    titleTa: "ESP8266 WiFi மாட்யூல் முழு வழிகாட்டி",
    desc: "Learn to connect ESP8266 to WiFi, send HTTP requests, and build your first IoT project from scratch.",
    descTa:
      "ESP8266 ஐ WiFi உடன் இணைக்கவும், HTTP கோரிக்கைகள் அனுப்பவும் கற்றுக்கொள்ளுங்கள்.",
    duration: "1hr 20min",
    level: "Intermediate",
    youtube: "https://youtube.com",
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    id: 3,
    type: "documentation",
    category: "webDev",
    title: "React.js Full Documentation",
    titleTa: "React.js முழுமையான ஆவணம்",
    desc: "Comprehensive React documentation covering components, hooks, state management, routing, and real project examples.",
    descTa:
      "கூறுகள், hooks, state management மற்றும் routing உள்ளடக்கிய React ஆவணம்.",
    duration: "Read",
    level: "Intermediate",
    youtube: null,
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    id: 4,
    type: "tutorial",
    category: "embedded",
    title: "UART, I2C, SPI Communication",
    titleTa: "UART, I2C, SPI தொடர்பு",
    desc: "Master serial communication protocols used in embedded systems with hands-on examples and wiring diagrams.",
    descTa:
      "எம்பெடட் சிஸ்டம்களில் பயன்படுத்தப்படும் தொடர் தொடர்பு நெறிமுறைகளை கற்றுக்கொள்ளுங்கள்.",
    duration: "1hr",
    level: "Intermediate",
    youtube: "https://youtube.com",
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    id: 5,
    type: "video",
    category: "webDev",
    title: "HTML & CSS Crash Course",
    titleTa: "HTML & CSS விரைவுப் பாடநெறி",
    desc: "Build beautiful responsive websites from scratch using HTML5 and CSS3. Covers Flexbox, Grid, and animations.",
    descTa:
      "HTML5 மற்றும் CSS3 மூலம் அழகான ரெஸ்பான்சிவ் இணையதளங்களை உருவாக்குங்கள்.",
    duration: "2hr",
    level: "Beginner",
    youtube: "https://youtube.com",
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    id: 6,
    type: "documentation",
    category: "iot",
    title: "MQTT Protocol for IoT",
    titleTa: "IoT க்கான MQTT நெறிமுறை",
    desc: "Deep-dive into MQTT protocol, broker setup with Mosquitto, and publishing/subscribing from embedded devices.",
    descTa:
      "MQTT நெறிமுறை, Mosquitto broker setup மற்றும் எம்பெடட் சாதனங்களில் இருந்து publish/subscribe.",
    duration: "Read",
    level: "Advanced",
    youtube: null,
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    id: 7,
    type: "tutorial",
    category: "ai",
    title: "Python for AI/ML Beginners",
    titleTa: "AI/ML தொடக்கர்களுக்கான Python",
    desc: "Learn Python fundamentals, NumPy, Pandas, and build your first machine learning model using scikit-learn.",
    descTa:
      "Python அடிப்படைகள், NumPy, Pandas மற்றும் scikit-learn மூலம் ML மாடல் உருவாக்குங்கள்.",
    duration: "3hr",
    level: "Beginner",
    youtube: "https://youtube.com",
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    id: 8,
    type: "video",
    category: "embedded",
    title: "PCB Design with KiCad",
    titleTa: "KiCad மூலம் PCB வடிவமைப்பு",
    desc: "Design your own printed circuit boards from schematic to layout using the free and open-source KiCad EDA tool.",
    descTa: "KiCad EDA கருவி மூலம் schema முதல் layout வரை PCB வடிவமைக்கவும்.",
    duration: "2hr 30min",
    level: "Advanced",
    youtube: "https://youtube.com",
    docs: "#",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
];

// ── Static fallback data (shown until API loads) ───────────────────────────────
const staticData = [
  {
    _id: "s1",
    type: "tutorial",
    category: "embedded",
    title: "Getting Started with Arduino",
    titleTa: "Arduino இல் தொடங்குவது எப்படி",
    description:
      "A complete beginner's guide to Arduino programming — from LED blinking to sensor interfacing.",
    descriptionTa: "Arduino நிரலாக்கத்திற்கான முழுமையான தொடக்க வழிகாட்டி.",
    duration: "45 min",
    level: "Beginner",
    youtubeLink: "https://youtube.com",
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    _id: "s2",
    type: "video",
    category: "iot",
    title: "ESP8266 WiFi Module Complete Guide",
    titleTa: "ESP8266 WiFi மாட்யூல் முழு வழிகாட்டி",
    description:
      "Learn to connect ESP8266 to WiFi, send HTTP requests, and build your first IoT project.",
    descriptionTa: "ESP8266 ஐ WiFi உடன் இணைக்கவும்.",
    duration: "1hr 20min",
    level: "Intermediate",
    youtubeLink: "https://youtube.com",
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    _id: "s3",
    type: "documentation",
    category: "webDev",
    title: "React.js Full Documentation",
    titleTa: "React.js முழுமையான ஆவணம்",
    description:
      "Comprehensive React documentation covering components, hooks, state management, routing.",
    descriptionTa: "React ஆவணம் — hooks, state, routing.",
    duration: "Read",
    level: "Intermediate",
    youtubeLink: null,
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    _id: "s4",
    type: "tutorial",
    category: "embedded",
    title: "UART, I2C, SPI Communication",
    titleTa: "UART, I2C, SPI தொடர்பு",
    description:
      "Master serial communication protocols with hands-on examples and wiring diagrams.",
    descriptionTa: "எம்பெடட் தொடர் தொடர்பு நெறிமுறைகள்.",
    duration: "1hr",
    level: "Intermediate",
    youtubeLink: "https://youtube.com",
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    _id: "s5",
    type: "video",
    category: "webDev",
    title: "HTML & CSS Crash Course",
    titleTa: "HTML & CSS விரைவுப் பாடநெறி",
    description:
      "Build beautiful responsive websites from scratch using HTML5 and CSS3.",
    descriptionTa: "HTML5 மற்றும் CSS3 மூலம் இணையதளங்கள்.",
    duration: "2hr",
    level: "Beginner",
    youtubeLink: "https://youtube.com",
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    _id: "s6",
    type: "documentation",
    category: "iot",
    title: "MQTT Protocol for IoT",
    titleTa: "IoT க்கான MQTT நெறிமுறை",
    description: "Deep-dive into MQTT protocol, broker setup with Mosquitto.",
    descriptionTa: "MQTT நெறிமுறை மற்றும் Mosquitto broker.",
    duration: "Read",
    level: "Advanced",
    youtubeLink: null,
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
  {
    _id: "s7",
    type: "tutorial",
    category: "ai",
    title: "Python for AI/ML Beginners",
    titleTa: "AI/ML தொடக்கர்களுக்கான Python",
    description:
      "Learn Python fundamentals, NumPy, Pandas, and build your first ML model.",
    descriptionTa: "Python, NumPy, Pandas மற்றும் ML மாடல்.",
    duration: "3hr",
    level: "Beginner",
    youtubeLink: "https://youtube.com",
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  },
  {
    _id: "s8",
    type: "video",
    category: "embedded",
    title: "PCB Design with KiCad",
    titleTa: "KiCad மூலம் PCB வடிவமைப்பு",
    description:
      "Design your own printed circuit boards from schematic to layout using KiCad.",
    descriptionTa: "KiCad மூலம் PCB வடிவமைக்கவும்.",
    duration: "2hr 30min",
    level: "Advanced",
    youtubeLink: "https://youtube.com",
    thumbnailFile: "",
    gif: "https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif",
  },
];

// ── Normalise DB item → same shape as staticData ──────────────────────────────
const normalise = (item) => ({
  _id: item._id,
  type: item.type,
  category: item.category,
  title: item.title,
  titleTa: item.titleTa || item.title,
  description: item.description,
  descriptionTa: item.descriptionTa || item.description,
  duration: item.duration || "",
  level: item.level,
  youtubeLink: item.youtubeLink || null,
  documentFile: item.documentFile || null,
  videoFile: item.videoFile || null,
  gif: item.thumbnailFile
    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"}${item.thumbnailFile}`
    : "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif",
  fromDB: true,
});

const Learning = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [activeType, setActiveType] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [allItems, setAllItems] = useState(staticData);
  const [fetching, setFetching] = useState(true);

  // ── Fetch DB content and merge with static ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/content?limit=100`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("k2i_token") || ""}`,
          },
        });
        if (!res.ok) throw new Error("not ok");
        const data = await res.json();
        if (data.success && data.content?.length > 0) {
          const dbItems = data.content.map(normalise);
          // Put DB items first (most recent), then static items
          setAllItems([...dbItems, ...staticData]);
        }
      } catch {
        // API unreachable or unauthenticated → keep static data only
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  const types = ["all", "tutorial", "video", "documentation"];
  const typeLabels = {
    all: t.allCategories,
    tutorial: t.tutorials,
    video: t.videos,
    documentation: t.documentation,
  };
  const typeIcons = {
    tutorial: "fa-graduation-cap",
    video: "fa-play-circle",
    documentation: "fa-file-alt",
  };

  const filtered = allItems.filter((item) => {
    const matchType = activeType === "all" || item.type === activeType;
    const matchCat =
      activeCategory === "all" || item.category === activeCategory;
    const title = language === "ta" ? item.titleTa : item.title;
    const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchCat && matchSearch;
  });

  const levelColors = {
    Beginner: "#14655b",
    Intermediate: "#d97706",
    Advanced: "#dc2626",
  };

  return (
    <div className="learning-page">
      {/* Hero */}
      <section className="learning-hero">
        <div className="learning-hero-inner" data-aos="fade-up">
          <div>
            <img
              src="https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif"
              alt="Learning"
              className="learning-hero-gif"
            />
          </div>
          <div>
            <h1 className={language === "ta" ? "tamil-text" : ""}>
              {t.learningHeroTitle}
            </h1>
            <p className={language === "ta" ? "tamil-text" : ""}>
              {t.learningHeroSub}
            </p>
          </div>
        </div>
      </section>

      {/* Type Tabs */}
      <section className="learning-tabs-section">
        <div className="learning-tabs">
          {types.map((type) => (
            <button
              key={type}
              className={`tab-btn ${activeType === type ? "tab-btn-active" : ""}`}
              onClick={() => setActiveType(type)}
            >
              {type !== "all" && <i className={`fas ${typeIcons[type]}`}></i>}
              <span className={language === "ta" ? "tamil-text" : ""}>
                {typeLabels[type]}
              </span>
            </button>
          ))}
        </div>

        <div className="learning-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Grid */}
      <section className="learning-grid-section">
        {fetching && (
          <div
            style={{
              textAlign: "center",
              padding: "30px 0",
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.9rem",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                border: "3px solid rgba(71,255,235,0.2)",
                borderTopColor: "#47ffeb",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                margin: "0 auto 10px",
              }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading content…
          </div>
        )}
        <div className="learning-grid">
          {filtered.map((item, i) => {
            const title = language === "ta" ? item.titleTa : item.title;
            const desc =
              language === "ta"
                ? item.descriptionTa || item.description
                : item.description;
            const thumb =
              item.gif ||
              item.thumbnailFile ||
              "https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif";
            const ytLink = item.youtubeLink || item.youtube || null;
            const docLink = item.documentFile
              ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"}${item.documentFile}`
              : item.docs || "#";
            return (
              <div
                className="learning-card"
                key={item._id || item.id}
                data-aos="fade-up"
                data-aos-delay={i * 70}
              >
                <div className="learning-card-image">
                  <img src={thumb} alt={title} />
                  <div className="learning-type-badge">
                    <i
                      className={`fas ${typeIcons[item.type] || "fa-book"}`}
                    ></i>
                    {typeLabels[item.type]}
                  </div>
                  {item.fromDB && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(71,255,235,0.18)",
                        border: "1px solid rgba(71,255,235,0.35)",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: "0.7rem",
                        color: "#47ffeb",
                        fontWeight: 700,
                      }}
                    >
                      NEW
                    </div>
                  )}
                </div>
                <div className="learning-card-body">
                  <div className="learning-meta">
                    <span
                      className="learning-level"
                      style={{ backgroundColor: levelColors[item.level] }}
                    >
                      {item.level}
                    </span>
                    {item.duration && (
                      <span className="learning-duration">
                        <i className="fas fa-clock"></i> {item.duration}
                      </span>
                    )}
                  </div>
                  <h3 className={language === "ta" ? "tamil-text" : ""}>
                    {title}
                  </h3>
                  <p className={language === "ta" ? "tamil-text" : ""}>
                    {desc}
                  </p>
                  <div className="learning-actions">
                    {ytLink && (
                      <a
                        href={ytLink}
                        target="_blank"
                        rel="noreferrer"
                        className="learn-btn learn-btn-primary"
                      >
                        <i className="fab fa-youtube"></i>
                        <span className={language === "ta" ? "tamil-text" : ""}>
                          {t.watchNow}
                        </span>
                      </a>
                    )}
                    {item.videoFile && (
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:7000"}${item.videoFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="learn-btn learn-btn-primary"
                      >
                        <i className="fas fa-play"></i>
                        <span>Watch Video</span>
                      </a>
                    )}
                    <a
                      href={docLink}
                      target={item.documentFile ? "_blank" : "_self"}
                      rel="noreferrer"
                      className="learn-btn learn-btn-secondary"
                    >
                      <i className="fas fa-file-alt"></i>
                      <span className={language === "ta" ? "tamil-text" : ""}>
                        {t.readMore}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
          {!fetching && filtered.length === 0 && (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "40px 20px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              No content found for the selected filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Learning;
