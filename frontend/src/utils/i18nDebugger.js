/**
 * ✅ LANGUAGE PERSISTENCE VERIFICATION SCRIPT
 * 
 * This script helps verify language persistence in localStorage
 * and provides debugging information for i18n implementation.
 * 
 * Usage in browser console:
 * 1. Copy this entire file into browser DevTools Console
 * 2. Call specific functions to debug
 */

window.FarmConnectI18nDebug = {
  /**
   * Check current language settings
   */
  checkCurrentLanguage() {
    const htmlLang = document.documentElement.lang;
    const storageLang = localStorage.getItem("farmconnect_language");
    
    console.log("=== LANGUAGE CONFIG ===");
    console.log(`📄 HTML lang attribute: ${htmlLang}`);
    console.log(`💾 localStorage language: ${storageLang}`);
    console.log(`✅ Match: ${htmlLang === storageLang}`);
    
    return { htmlLang, storageLang, match: htmlLang === storageLang };
  },

  /**
   * Test persistence by simulating page refresh
   */
  async testPersistence() {
    console.log("=== PERSISTENCE TEST ===");
    
    // Set to Hindi
    localStorage.setItem("farmconnect_language", "hi");
    document.documentElement.lang = "hi";
    console.log("✅ Set language to Hindi");
    console.log("🔄 Now refresh the page (F5)");
    console.log("⏳ Check if page loads in Hindi");
  },

  /**
   * Verify all supported languages
   */
  getSupportedLanguages() {
    console.log("=== SUPPORTED LANGUAGES ===");
    const langs = [
      { code: "en", name: "English" },
      { code: "hi", name: "हिंदी (Hindi)" },
      { code: "mr", name: "मराठी (Marathi)" },
    ];
    
    langs.forEach((lang) => {
      console.log(`✅ ${lang.code.toUpperCase()}: ${lang.name}`);
    });
    
    return langs;
  },

  /**
   * Check localStorage health
   */
  checkLocalStorageHealth() {
    console.log("=== LOCALSTORAGE HEALTH ===");
    
    try {
      const testKey = "_test_farmconnect_" + Date.now();
      localStorage.setItem(testKey, "test");
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      console.log("✅ localStorage is working");
      
      const langKey = localStorage.getItem("farmconnect_language");
      if (langKey) {
        console.log(`✅ Language key found: ${langKey}`);
      } else {
        console.log("⚠️ Language key not found (will default to English)");
      }
    } catch (error) {
      console.error("❌ localStorage ERROR:", error);
    }
  },

  /**
   * Simulate language switch and measure performance
   */
  async measureLanguageSwitchPerformance() {
    console.log("=== PERFORMANCE TEST ===");
    
    const languages = ["en", "hi", "mr"];
    const results = [];
    
    for (const lang of languages) {
      const start = performance.now();
      localStorage.setItem("farmconnect_language", lang);
      document.documentElement.lang = lang;
      
      // Trigger a small re-render
      const event = new CustomEvent("languageChanged", { detail: { language: lang } });
      window.dispatchEvent(event);
      
      const end = performance.now();
      const time = end - start;
      
      results.push({ language: lang, time: `${time.toFixed(2)}ms` });
      console.log(`${lang}: ${time.toFixed(2)}ms`);
    }
    
    return results;
  },

  /**
   * Generate HTML lang attribute status report
   */
  generateReport() {
    console.clear();
    console.log("%c=== FARMCONNECT i18n DEBUG REPORT ===", "font-weight: bold; font-size: 14px;");
    
    const htmlLang = document.documentElement.lang;
    const storageLang = localStorage.getItem("farmconnect_language");
    const storageSize = new Blob(Object.entries(localStorage)).size;
    
    console.log(`\n📄 Current HTML lang: ${htmlLang}`);
    console.log(`💾 Current Storage lang: ${storageLang}`);
    console.log(`📊 localStorage size: ${storageSize} bytes`);
    console.log(`✅ Languages in sync: ${htmlLang === storageLang}`);
    
    // Check for translation function
    if (window.useLanguage) {
      console.log(`✅ useLanguage hook is available`);
    } else {
      console.log(`⚠️ useLanguage hook not found (React context may not be initialized)`);
    }
    
    console.log("%cEND REPORT", "font-weight: bold;");
  },

  /**
   * Clear all language data and reset to English
   */
  resetLanguageData() {
    console.log("⚠️ Resetting language data...");
    localStorage.removeItem("farmconnect_language");
    document.documentElement.lang = "en";
    window.location.reload();
  },

  /**
   * Export localStorage data
   */
  exportData() {
    const data = {
      language: localStorage.getItem("farmconnect_language"),
      htmlLang: document.documentElement.lang,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    
    console.log("📤 Exported Data:", data);
    return data;
  },
};

// Auto-run on load
console.log("%c✅ FarmConnectI18nDebug loaded!", "color: green; font-weight: bold;");
console.log("Available functions:");
console.log("  - FarmConnectI18nDebug.checkCurrentLanguage()");
console.log("  - FarmConnectI18nDebug.testPersistence()");
console.log("  - FarmConnectI18nDebug.getSupportedLanguages()");
console.log("  - FarmConnectI18nDebug.checkLocalStorageHealth()");
console.log("  - FarmConnectI18nDebug.measureLanguageSwitchPerformance()");
console.log("  - FarmConnectI18nDebug.generateReport()");
console.log("  - FarmConnectI18nDebug.resetLanguageData()");
console.log("  - FarmConnectI18nDebug.exportData()");
