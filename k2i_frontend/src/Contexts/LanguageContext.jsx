// import { createContext } from "react";

// export const LanguageContext = createContext();

// LanguageContext.jsx
import { createContext, useContext } from "react";

// 1. Create context
export const LanguageContext = createContext();

// 2. Create and export useLanguage hook
export const useLanguage = () => useContext(LanguageContext);
