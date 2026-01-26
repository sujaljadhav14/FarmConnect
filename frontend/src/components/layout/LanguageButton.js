import React, { useState } from "react";
import { useLanguage } from "../../context/languageContext";
import "./LanguageButton.css";

/**
 * ✅ Language Selector Component
 * Features:
 * - Clean button group UI
 * - Tooltip for language names
 * - Keyboard accessible (Tab, Enter, Space)
 * - No layout shift on language change
 */
const LanguageButton = () => {
  const { language, changeLanguage, getSupportedLanguages } = useLanguage();
  const [activeTooltip, setActiveTooltip] = useState(null);

  const languages = getSupportedLanguages();

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setActiveTooltip(null);
  };

  const handleKeyDown = (e, langCode) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLanguageChange(langCode);
    }
  };

  return (
    <div className="language-button-container" role="group" aria-label="Language selector">
      <div className="btn-group" role="group">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            className={`btn btn-sm language-btn ${language === lang.code ? "active" : ""}`}
            onClick={() => handleLanguageChange(lang.code)}
            onKeyDown={(e) => handleKeyDown(e, lang.code)}
            onMouseEnter={() => setActiveTooltip(lang.code)}
            onMouseLeave={() => setActiveTooltip(null)}
            onFocus={() => setActiveTooltip(lang.code)}
            onBlur={() => setActiveTooltip(null)}
            title={lang.name}
            aria-label={`Select ${lang.name}`}
            aria-pressed={language === lang.code}
            disabled={language === lang.code}
            data-testid={`lang-btn-${lang.code}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
      {/* Tooltip */}
      {activeTooltip && (
        <div
          className="language-tooltip"
          role="tooltip"
          data-testid="language-tooltip"
        >
          {languages.find((l) => l.code === activeTooltip)?.name}
        </div>
      )}
    </div>
  );
};

export default LanguageButton;
