import React from "react";
import { IconUsersGroup, IconBook2, IconTools, IconBulb, IconWorldWww } from "@tabler/icons-react";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Whyk2i.css";

const Whyk2i = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const items = [
    { icon: <IconUsersGroup size={28} className="abt-icon" />, key: "abtc1" },
    { icon: <IconBook2 size={20} className="abt-icon" />, key: "abtc2" },
    { icon: <IconTools size={20} className="abt-icon" />, key: "abtc3" },
    { icon: <IconBulb size={20} className="abt-icon" />, key: "abtc4" },
    { icon: <IconWorldWww size={20} className="abt-icon" />, key: "abtc5" },
  ];

  return (
    <>
      <div className="abt-text" data-aos="fade-up">
        <h1 className={`abt-text-title ${language === "ta" ? "abt-text-title-ta" : "abt-text-title-en"}`}>
          {t.abttitle}
          <span className="k2i">Knowledge2Intelligence ?</span>
        </h1>
        <p className={`abt-text-para ${language === "ta" ? "abt-text-para-ta" : "abt-text-para-en"}`}>
          {t.abtpara}
        </p>
      </div>
      <div className="abt-main-container">
        <div className="abt-content">
          <ul className="abt-content-ul">
            {items.map((item, i) => (
              <li key={i} data-aos="fade-right" data-aos-delay={i * 80}>
                {item.icon}
                <span className={language === "ta" ? "tamil-text" : ""}>{t[item.key]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="abt-image" data-aos="fade-left">
          <img src="https://k2i.s3.eu-north-1.amazonaws.com/whyk2i.gif" loading="lazy" alt="Why K2I" />
        </div>
      </div>
    </>
  );
};

export default Whyk2i;
