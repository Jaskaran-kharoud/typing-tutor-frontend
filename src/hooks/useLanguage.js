import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const [language, setLanguage] = useState('english');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    localStorage.setItem('selectedLanguage', newLanguage);
    setLanguage(newLanguage);
  };

  return { language, changeLanguage };
};

export const languageConfig = {
  english: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  hindi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳'
  },
  punjabi: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳'
  },
  marathi: {
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳'
  }
};
