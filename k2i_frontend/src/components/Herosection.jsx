import React, { useEffect, useState, useRef, memo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../Contexts/LanguageContext.jsx";
import { translations } from "../Contexts/translations.js";
import "../assets/Css/Herosection.css";

const Home = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const [words, setWords] = useState([]);
  const [textState, setTextState] = useState({
    currentText: "",
    charIndex: 0,
    wordIndex: 0,
    typing: true,
  });
  const [fade, setFade] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setWords([
      { text: t.herotitle2a, className: "text-title-a" },
      { text: t.herotitle2b, className: "text-title-b" },
    ]);
    setTextState({ currentText: "", charIndex: 0, wordIndex: 0, typing: true });
  }, [language]);

  useEffect(() => {
    if (!words.length) return;
    const word = words[textState.wordIndex].text;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTextState((prev) => {
        const { charIndex, typing, currentText, wordIndex } = prev;
        if (typing) {
          if (charIndex < word.length) {
            return {
              ...prev,
              currentText: currentText + word[charIndex],
              charIndex: charIndex + 1,
            };
          } else {
            clearInterval(intervalRef.current);
            setTimeout(() => setTextState((p) => ({ ...p, typing: false })), 1000);
            return prev;
          }
        } else {
          if (charIndex > 0) {
            return {
              ...prev,
              currentText: currentText.slice(0, -1),
              charIndex: charIndex - 1,
            };
          } else {
            clearInterval(intervalRef.current);
            return {
              currentText: "",
              charIndex: 0,
              wordIndex: (wordIndex + 1) % words.length,
              typing: true,
            };
          }
        }
      });
    }, textState.typing ? 100 : 50);

    return () => clearInterval(intervalRef.current);
  }, [textState.charIndex, textState.typing, textState.wordIndex, words]);

  useEffect(() => {
    const timer = setTimeout(() => setFade(true), 200);
    return () => clearTimeout(timer);
  }, [language]);

  return (
    <div className={`home-container ${fade ? "fade show" : "fade"}`}>
      <div className="home-text">
        <h1 className={`home-text-1 ${language === "ta" ? "home-text-ta" : "home-text-eg"}`}>
          {t.herotitle1}
        </h1>

        {words.length > 0 && (
          <h1 className={`home-text-2 ${words[textState.wordIndex].className}`}>
            {textState.currentText}
            <span className="cursor">|</span>
          </h1>
        )}

        <p>
          {t.herocontent1}
          <br />
          {t.herocontent2}
        </p>

        <Link>
          <button className="shiny-button">Get Started</button>
        </Link>
      </div>

      <div className="home-image">
        {fade && (
          <img
            src="https://k2i.s3.eu-north-1.amazonaws.com/homeherosec.gif" // use local WebP version
            alt="Business Man"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
};

export default memo(Home);
