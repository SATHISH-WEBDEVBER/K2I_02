import React from "react";
import { IconPlayerPlay, IconFileCode, IconCpu, IconBrandGithub } from "@tabler/icons-react";
import "../assets/Css/Whatweoffer.css";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";

const WhatWeOffer = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const features = [
    { icon: <IconPlayerPlay size={28} />, key: "wwoc1" },
    { icon: <IconFileCode size={28} />, key: "wwoc2" },
    { icon: <IconCpu size={28} />, key: "wwoc3" },
    { icon: <IconBrandGithub size={28} />, key: "wwoc4" },
  ];

  return (
    <div className="offer-container">
      <div className="offer-title-container" data-aos="fade-up">
        <h2 className={`offer-title ${language === "ta" ? "offer-title-ta" : ""}`}>
          <span>{t.wwotitle}</span>
        </h2>
        <p className={`card-text ${language === "ta" ? "card-text-ta" : ""}`}>{t.wwopara}</p>
      </div>
      <div className="whatweoffer-container">
        {features.map((feature, index) => (
          <div className="offer-card" key={index} data-aos="zoom-in" data-aos-delay={index * 100}>
            <div className="icon-container">
              <div className="icon-circle">{feature.icon}</div>
            </div>
            <p className={`card-text ${language === "ta" ? "tamil-text" : ""}`}>{t[feature.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatWeOffer;
