import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnabledLanguages } from '../config/languages';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelection.css';

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { changeLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languages = getEnabledLanguages();

  const handleLanguageSelect = (languageId) => {
    setSelectedLanguage(languageId);
    changeLanguage(languageId);
    
    // Navigate to dashboard after brief delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 300);
  };

  return (
    <div className="language-selection-container">
      <div className="language-content">
        <div className="language-header">
          <h1>Welcome to Typing Tutor</h1>
          <p>Choose your language to begin your typing journey</p>
        </div>

        <div className="language-grid">
          {languages.map((language) => (
            <div
              key={language.id}
              className={`language-card ${selectedLanguage === language.id ? 'selected' : ''}`}
              onClick={() => handleLanguageSelect(language.id)}
            >
              <div className="language-flag">{language.flag}</div>
              <h2>{language.name}</h2>
              <p className="native-name" style={{ fontFamily: language.font }}>
                {language.nativeName}
              </p>
              <p className="language-description">{language.description}</p>
              <div className="select-indicator">
                {selectedLanguage === language.id ? '✓ Selected' : 'Select'}
              </div>
            </div>
          ))}
        </div>

        <div className="language-footer">
          <p>You can change your language preference anytime from settings</p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
