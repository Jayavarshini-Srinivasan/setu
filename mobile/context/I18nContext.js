import {
  createContext,
  useContext,
  useState,
  useEffect,
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

  useEffect(() => {
    loadLanguage();
  }, []);

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

  const getValueCaseInsensitive = (obj, key) => {
    if (!obj || typeof obj !== "object") return undefined;
    const target = key.toLowerCase().replace(/[-_\s]+/g, "");
    const foundKey = Object.keys(obj).find(
      (k) => k.toLowerCase().replace(/[-_\s]+/g, "") === target
    );
    return foundKey ? obj[foundKey] : undefined;
  };

  /*
    TRANSLATE FUNCTION
    Usage: t("login") => "साइन इन करें" (in Hindi)
  */
  const applyVars = (text, vars) => {
    if (typeof text !== "string" || !vars || typeof vars !== "object") return text;
    return Object.entries(vars).reduce(
      (acc, [varKey, varVal]) =>
        acc.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varVal ?? "")),
      text
    );
  };

  const t = (key, vars) => {
    if (!key) return "";

    const langStrings = translations[language] || translations.en;

    // Support nested keys like "roles.auto_driver"
    if (key.includes(".")) {
      const keys = key.split(".");

      let result = langStrings;
      for (const k of keys) {
        result = getValueCaseInsensitive(result, k);
        if (result === undefined) break;
      }
      if (result !== undefined) return applyVars(result, vars);

      let fallbackResult = translations.en;
      for (const k of keys) {
        fallbackResult = getValueCaseInsensitive(fallbackResult, k);
        if (fallbackResult === undefined) break;
      }
      return applyVars(
        fallbackResult !== undefined ? fallbackResult : undefined,
        vars
      );
    }

    const flat =
      getValueCaseInsensitive(langStrings, key) ||
      getValueCaseInsensitive(translations.en, key) ||
      undefined;
    return applyVars(flat, vars);
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
