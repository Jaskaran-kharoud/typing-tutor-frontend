import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguageConfig, isLanguageEnabled } from '../config/languages';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [languageConfig, setLanguageConfig] = useState(getLanguageConfig('english'));

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && isLanguageEnabled(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      setLanguageConfig(getLanguageConfig(savedLanguage));
    }
  }, []);

  const changeLanguage = (languageId) => {
    if (isLanguageEnabled(languageId)) {
      setCurrentLanguage(languageId);
      setLanguageConfig(getLanguageConfig(languageId));
      localStorage.setItem('selectedLanguage', languageId);
      return true;
    }
    return false;
  };

  const value = {
    language: currentLanguage,
    config: languageConfig,
    changeLanguage,
    hasSelectedLanguage: () => localStorage.getItem('selectedLanguage') !== null
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
