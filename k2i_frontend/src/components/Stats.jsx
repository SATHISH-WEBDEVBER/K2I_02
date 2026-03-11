import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Stats.css";

const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const StatItem = ({ target, suffix, label, icon, start }) => {
  const count = useCounter(target, 1800, start);
  return (
    <div className="stat-item">
      <div className="stat-icon">{icon}</div>
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

const Stats = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const stats = [
    { target: 20, suffix: "+", label: t.statsProjects, icon: "🚀" },
    { target: 15, suffix: "+", label: t.statsTutorials, icon: "📚" },
    { target: 500, suffix: "+", label: t.statsLearners, icon: "👩‍💻" },
    { target: 2, suffix: "", label: t.statsLanguages, icon: "🌐" },
  ];

  return (
    <section className="stats-section" ref={ref}>
      <div className="stats-container">
        {stats.map((s, i) => (
          <StatItem key={i} {...s} start={visible} />
        ))}
      </div>
    </section>
  );
};

export default Stats;
