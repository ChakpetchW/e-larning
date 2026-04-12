import React, { createContext, useContext, useState, useEffect } from 'react';
import th from '../locales/th.json';
import en from '../locales/en.json';

const LanguageContext = createContext();

const locales = { th, en };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'th');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let value = locales[language];
    
    for (const key of keys) {
      if (value && value[key]) {
        value = value[key];
      } else {
        return keyPath; // Fallback to key path if not found
      }
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
