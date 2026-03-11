// import { useState, useEffect } from "react";
// import { LanguageContext } from "./LanguageContext";

// const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState("en");

//   useEffect(() => {
//     const savedLang = localStorage.getItem("appLanguage");
//     if (savedLang) {
//       setLanguage(savedLang);
//     }
//   }, []);

//   const toggleLanguage = () => {
//     const newLang = language === "en" ? "ta" : "en";
//     setLanguage(newLang);
//     localStorage.setItem("appLanguage", newLang);
//   };

//   return (
//     <LanguageContext.Provider value={{ language, toggleLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };

// export default LanguageProvider;
import { useState, useEffect } from "react";
import { LanguageContext } from "./LanguageContext"; // make sure path is correct

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("appLanguage");
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ta" : "en";
    setLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
