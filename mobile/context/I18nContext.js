import {
  createContext,
  useContext,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { translations } from "../constants/translations";

/*
  I18N CONTEXT
*/
const I18nContext = createContext();

const LANGUAGE_KEY = "@setu_language";

export const I18nProvider = ({ children }) => {

  const [language, setLanguage] = useState("en");

  /*
    LOAD SAVED LANGUAGE
  */
  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved) {
        setLanguage(saved);
      }
    } catch (e) {
      console.log("Failed to load language:", e);
    }
  };

  /*
    CHANGE LANGUAGE
  */
  const changeLanguage = async (code) => {
    try {
      setLanguage(code);
      await AsyncStorage.setItem(LANGUAGE_KEY, code);
    } catch (e) {
      console.log("Failed to save language:", e);
    }
  };

  /*
    TRANSLATE FUNCTION
    Usage: t("login") => "साइन इन करें" (in Hindi)
  */
  const t = (key) => {
    const langStrings = translations[language] || translations.en;
    return langStrings[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        changeLanguage,
        loadLanguage,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
