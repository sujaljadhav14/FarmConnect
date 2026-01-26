import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LanguageContext = createContext();

// ✅ COMPREHENSIVE Translation data for all pages & features
const translations = {
  en: {
    common: {
      home: "Home",
      register: "Register",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard",
      language: "Language",
      english: "English",
      hindi: "हिंदी",
      marathi: "मराठी",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      update: "Update",
      submit: "Submit",
      back: "Back",
      next: "Next",
      confirm: "Confirm",
      close: "Close",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      loading: "Loading...",
      noData: "No data found",
    },
    navigation: {
      home: "Home",
      register: "Register",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
    },
    homePage: {
      title: "Welcome to FarmConnect",
      subtitle: "Connecting Farmers, Traders & Transporters",
      description: "Direct connection between farmers and buyers - No middlemen, Fair prices, Secure payments",
      fairPricing: "💰 Fair Pricing",
      fairPricingDesc: "Farmers get the right price for their produce without middlemen",
      securePayments: "🔒 Secure Payments",
      securePaymentsDesc: "Payments go directly to farmers with advance payment options",
      connectTraders: "🤝 Connect Traders",
      connectTradersDesc: "Traders and customers can directly connect with verified farmers",
      trackManage: "📊 Track & Manage",
      trackManageDesc: "Farmers can track sales, stock, and orders in one place",
      getStarted: "Get Started Today",
      loginMessage: "Welcome back",
      registerMessage: "Join our community",
      notLoggedIn: "Start your journey with FarmConnect",
    },
    auth: {
      phoneNumber: "Phone Number",
      enterPhone: "Enter your 10-digit phone number",
      sendOTP: "Send OTP",
      verifyOTP: "Verify OTP",
      enterOTP: "Enter 6-digit OTP",
      resendOTP: "Resend OTP",
      invalidPhone: "Invalid phone number",
      invalidOTP: "Invalid OTP",
      otpSent: "OTP sent successfully",
      verificationSuccess: "Phone verified successfully",
      selectRole: "Select Your Role",
      farmer: "Farmer",
      trader: "Trader",
      transporter: "Transporter",
      admin: "Admin",
      fullName: "Full Name",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      agreeTerms: "I agree to Terms and Conditions",
      loginSuccess: "Login successful",
      registerSuccess: "Registration successful",
    },
    errors: {
      required: "This field is required",
      invalidEmail: "Please enter a valid email",
      passwordMismatch: "Passwords do not match",
      serverError: "Server error occurred",
      networkError: "Network error occurred",
      error: "Error",
      success: "Success",
      failed: "Failed",
      tryAgain: "Please try again",
      unauthorized: "Unauthorized access",
      notFound: "Not found",
      badRequest: "Invalid request",
      fetchError: "Failed to fetch data",
    },
    dashboard: {
      dashboard: "Dashboard",
      overview: "Overview",
      orders: "Orders",
      sales: "Sales",
      inventory: "Inventory",
      profile: "Profile",
      analytics: "Analytics",
      reports: "Reports",
      settings: "Settings",
    },
  },
  hi: {
    common: {
      home: "होम",
      register: "रजिस्टर करें",
      login: "लॉगिन",
      logout: "लॉगआउट",
      dashboard: "डैशबोर्ड",
      language: "भाषा",
      english: "English",
      hindi: "हिंदी",
      marathi: "मराठी",
      save: "सहेजें",
      cancel: "रद्द करें",
      delete: "हटाएं",
      edit: "संपादित करें",
      add: "जोड़ें",
      update: "अपडेट करें",
      submit: "जमा करें",
      back: "वापस",
      next: "अगला",
      confirm: "पुष्टि करें",
      close: "बंद करें",
      search: "खोजें",
      filter: "फ़िल्टर",
      sort: "सॉर्ट करें",
      loading: "लोड हो रहा है...",
      noData: "कोई डेटा नहीं मिला",
    },
    navigation: {
      home: "होम",
      register: "रजिस्टर करें",
      login: "लॉगिन",
      logout: "लॉगआउट",
      dashboard: "डैशबोर्ड",
      profile: "प्रोफाइल",
      settings: "सेटिंग्स",
    },
    homePage: {
      title: "फार्मकनेक्ट में आपका स्वागत है",
      subtitle: "किसान, व्यापारी और परिवहन को जोड़ना",
      description: "किसानों और खरीदारों के बीच सीधा संबंध - बिचौलिए नहीं, न्यायसंगत मूल्य, सुरक्षित भुगतान",
      fairPricing: "💰 न्यायसंगत मूल्य निर्धारण",
      fairPricingDesc: "किसानों को बिचौलियों के बिना उनकी उपज के लिए सही मूल्य मिलता है",
      securePayments: "🔒 सुरक्षित भुगतान",
      securePaymentsDesc: "भुगतान सीधे किसानों को अग्रिम भुगतान विकल्पों के साथ जाता है",
      connectTraders: "🤝 व्यापारियों से जुड़ें",
      connectTradersDesc: "व्यापारी और ग्राहक सत्यापित किसानों से सीधे जुड़ सकते हैं",
      trackManage: "📊 ट्रैक और प्रबंधन करें",
      trackManageDesc: "किसान बिक्री, स्टॉक और ऑर्डर को एक जगह पर ट्रैक कर सकते हैं",
      getStarted: "आज ही शुरुआत करें",
      loginMessage: "वापसी में आपका स्वागत है",
      registerMessage: "हमारे समुदाय में शामिल हों",
      notLoggedIn: "फार्मकनेक्ट के साथ अपनी यात्रा शुरू करें",
    },
    auth: {
      phoneNumber: "फोन नंबर",
      enterPhone: "अपना 10 अंकों का फोन नंबर दर्ज करें",
      sendOTP: "OTP भेजें",
      verifyOTP: "OTP सत्यापित करें",
      enterOTP: "6 अंकों का OTP दर्ज करें",
      resendOTP: "OTP दोबारा भेजें",
      invalidPhone: "अमान्य फोन नंबर",
      invalidOTP: "अमान्य OTP",
      otpSent: "OTP सफलतापूर्वक भेजा गया",
      verificationSuccess: "फोन सफलतापूर्वक सत्यापित हुआ",
      selectRole: "अपनी भूमिका चुनें",
      farmer: "किसान",
      trader: "व्यापारी",
      transporter: "परिवहन कर्मी",
      admin: "व्यवस्थापक",
      fullName: "पूरा नाम",
      email: "ईमेल",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड की पुष्टि करें",
      agreeTerms: "मैं शर्तों और शर्तों से सहमत हूँ",
      loginSuccess: "लॉगिन सफल",
      registerSuccess: "पंजीकरण सफल",
    },
    errors: {
      required: "यह क्षेत्र आवश्यक है",
      invalidEmail: "कृपया एक वैध ईमेल दर्ज करें",
      passwordMismatch: "पासवर्ड मेल नहीं खाते",
      serverError: "सर्वर त्रुटि हुई",
      networkError: "नेटवर्क त्रुटि हुई",
      error: "त्रुटि",
      success: "सफल",
      failed: "विफल",
      tryAgain: "कृपया पुनः प्रयास करें",
      unauthorized: "अनुमति नहीं है",
      notFound: "नहीं मिला",
      badRequest: "अमान्य अनुरोध",
      fetchError: "डेटा प्राप्त करने में विफल",
    },
    dashboard: {
      dashboard: "डैशबोर्ड",
      overview: "अवलोकन",
      orders: "ऑर्डर",
      sales: "बिक्री",
      inventory: "सूची",
      profile: "प्रोफाइल",
      analytics: "विश्लेषण",
      reports: "रिपोर्ट",
      settings: "सेटिंग्स",
    },
  },
  mr: {
    common: {
      home: "होम",
      register: "नोंदणी",
      login: "लॉगिन",
      logout: "लॉगआउट",
      dashboard: "डॅशबोर्ड",
      language: "भाषा",
      english: "English",
      hindi: "हिंदी",
      marathi: "मराठी",
      save: "जतन करा",
      cancel: "रद्द करा",
      delete: "हटवा",
      edit: "संपादित करा",
      add: "जोडा",
      update: "अपडेट करा",
      submit: "सादर करा",
      back: "परत",
      next: "पुढे",
      confirm: "खात्रीनिश्चय करा",
      close: "बंद करा",
      search: "शोधा",
      filter: "फिल्टर करा",
      sort: "क्रमवारी करा",
      loading: "लोड होत आहे...",
      noData: "कोणताही डेटा मिळाला नाही",
    },
    navigation: {
      home: "होम",
      register: "नोंदणी",
      login: "लॉगिन",
      logout: "लॉगआउट",
      dashboard: "डॅशबोर्ड",
      profile: "प्रोफाइल",
      settings: "सेटिंग्स",
    },
    homePage: {
      title: "फार्मकनेक्टमध्ये आपले स्वागत आहे",
      subtitle: "शेतकरी, व्यापारी आणि परिवहन जोडणे",
      description: "शेतकरी आणि खरेदीदार यांच्यातील थेट संबंध - कोणतेही मध्यस्थ नाही, न्याय्य किंमत, सुरक्षित पेमेंट",
      fairPricing: "💰 न्याय्य किंमत निर्धारण",
      fairPricingDesc: "शेतकरी बिचारांची मध्यस्थता न करता त्यांच्या उत्पादनांसाठी योग्य किंमत मिळवतात",
      securePayments: "🔒 सुरक्षित भुगतान",
      securePaymentsDesc: "भुगतान थेट शेतकरीकडे अग्रिम भुगतान पर्यायांसह जाते",
      connectTraders: "🤝 व्यापारीशी जुळा",
      connectTradersDesc: "व्यापारी आणि ग्राहक सत्यापित शेतकरीशी थेट जुळू शकतात",
      trackManage: "📊 ट्रॅक आणि व्यवस्थापन करा",
      trackManageDesc: "शेतकरी विक्रय, स्टॉक आणि ऑर्डर एका जागेवर ट्रॅक करू शकतात",
      getStarted: "आज सुरुवात करा",
      loginMessage: "पुन्हा स्वागत आहे",
      registerMessage: "आमच्या समुदायात सामील व्हा",
      notLoggedIn: "फार्मकनेक्टसह आपले प्रवास सुरू करा",
    },
    auth: {
      phoneNumber: "फोन क्रमांक",
      enterPhone: "आपला 10 अंकांचा फोन क्रमांक प्रविष्ट करा",
      sendOTP: "OTP पाठवा",
      verifyOTP: "OTP तपासा",
      enterOTP: "6 अंकांचा OTP प्रविष्ट करा",
      resendOTP: "OTP पुन्हा पाठवा",
      invalidPhone: "अवैध फोन क्रमांक",
      invalidOTP: "अवैध OTP",
      otpSent: "OTP यशस्वीरित्या पाठविले",
      verificationSuccess: "फोन यशस्वीरित्या सत्यापित",
      selectRole: "आपली भूमिका निवडा",
      farmer: "शेतकरी",
      trader: "व्यापारी",
      transporter: "वाहतुकीकार",
      admin: "प्रशासक",
      fullName: "पूर्ण नाव",
      email: "ई-मेल",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड खात्रीनिश्चय करा",
      agreeTerms: "मी अटी आणि शर्तींना सहमत आहे",
      loginSuccess: "लॉगिन यशस्वी",
      registerSuccess: "नोंदणी यशस्वी",
    },
    errors: {
      required: "हे क्षेत्र आवश्यक आहे",
      invalidEmail: "कृपया वैध ई-मेल प्रविष्ट करा",
      passwordMismatch: "पासवर्ड जुळत नाहीत",
      serverError: "सर्व्हर त्रुटी आली",
      networkError: "नेटवर्क त्रुटी आली",
      error: "त्रुटी",
      success: "यश",
      failed: "अयशस्वी",
      tryAgain: "कृपया पुन्हा प्रयत्न करा",
      unauthorized: "प्रवेश नाही",
      notFound: "सापडले नाही",
      badRequest: "अवैध विनंती",
      fetchError: "डेटा मिळवण्यात अयशस्वी",
    },
    dashboard: {
      dashboard: "डॅशबोर्ड",
      overview: "विहंगावलोकन",
      orders: "ऑर्डर",
      sales: "विक्रय",
      inventory: "इन्व्हेंटरी",
      profile: "प्रोफाइल",
      analytics: "विश्लेषण",
      reports: "अहवाले",
      settings: "सेटिंग्स",
    },
    navigation: {
      home: "होम",
      register: "नोंदणी",
      login: "लॉगिन",
      logout: "लॉगआउट",
      dashboard: "डॅशबोर्ड",
      profile: "प्रोफाइल",
      settings: "सेटिंग्स",
    },
    homePage: {
      title: "फार्मकनेक्टमध्ये आपले स्वागत आहे",
      subtitle: "शेतकरी, व्यापारी आणि परिवहन जोडणे",
      description: "शेतकरी आणि खरेदीदार यांच्यातील थेट संबंध - कोणतेही मध्यस्थ नाही, न्याय्य किंमत, सुरक्षित भुगतान",
      fairPricing: "💰 न्याय्य किंमत निर्धारण",
      fairPricingDesc: "शेतकरी बिचारांची मध्यस्थता न करता त्यांच्या उत्पादनांसाठी योग्य किंमत मिळवतात",
      securePayments: "🔒 सुरक्षित भुगतान",
      securePaymentsDesc: "भुगतान थेट शेतकरीकडे अग्रिम भुगतान पर्यायांसह जाते",
      connectTraders: "🤝 व्यापारीशी जुळा",
      connectTradersDesc: "व्यापारी आणि ग्राहक सत्यापित शेतकरीशी थेट जुळू शकतात",
      trackManage: "📊 ट्रॅक आणि व्यवस्थापन करा",
      trackManageDesc: "शेतकरी विक्रय, स्टॉक आणि ऑर्डर एका जागेवर ट्रॅक करू शकतात",
      getStarted: "आज सुरुवात करा",
      loginMessage: "पुन्हा स्वागत आहे",
      registerMessage: "आमच्या समुदायात सामील व्हा",
      notLoggedIn: "फार्मकनेक्टसह आपले प्रवास सुरू करा",
    },
    auth: {
      phoneNumber: "फोन क्रमांक",
      enterPhone: "आपला 10 अंकांचा फोन क्रमांक प्रविष्ट करा",
      sendOTP: "OTP पाठवा",
      verifyOTP: "OTP तपासा",
      enterOTP: "6 अंकांचा OTP प्रविष्ट करा",
      resendOTP: "OTP पुन्हा पाठवा",
      invalidPhone: "अवैध फोन क्रमांक",
      invalidOTP: "अवैध OTP",
      otpSent: "OTP यशस्वीरित्या पाठविले",
      verificationSuccess: "फोन यशस्वीरित्या सत्यापित",
      selectRole: "आपली भूमिका निवडा",
      farmer: "शेतकरी",
      trader: "व्यापारी",
      transporter: "वाहतुकीकार",
      admin: "प्रशासक",
      fullName: "पूर्ण नाव",
      email: "ई-मेल",
      password: "पासवर्ड",
      confirmPassword: "पासवर्ड खात्रीनिश्चय करा",
      agreeTerms: "मी अटी आणि शर्तींना सहमत आहे",
      loginSuccess: "लॉगिन यशस्वी",
      registerSuccess: "नोंदणी यशस्वी",
    },
    errors: {
      required: "हे क्षेत्र आवश्यक आहे",
      invalidEmail: "कृपया वैध ई-मेल प्रविष्ट करा",
      passwordMismatch: "पासवर्ड जुळत नाहीत",
      serverError: "सर्व्हर त्रुटी आली",
      networkError: "नेटवर्क त्रुटी आली",
      error: "त्रुटी",
      success: "यश",
      failed: "अयशस्वी",
      tryAgain: "कृपया पुन्हा प्रयत्न करा",
      unauthorized: "प्रवेश नाही",
      notFound: "सापडले नाही",
      badRequest: "अवैध विनंती",
      fetchError: "डेटा मिळवण्यात अयशस्वी",
    },
    dashboard: {
      dashboard: "डॅशबोर्ड",
      overview: "विहंगावलोकन",
      orders: "ऑर्डर",
      sales: "विक्रय",
      inventory: "इन्व्हेंटरी",
      profile: "प्रोफाइल",
      analytics: "विश्लेषण",
      reports: "अहवाले",
      settings: "सेटिंग्स",
    },
  },
};

/**
 * ✅ PRODUCTION-READY Language Provider
 * Features:
 * - Persistent language selection (localStorage)
 * - Safe fallback for missing translations
 * - HTML lang attribute support
 * - RTL-ready (future Arabic support)
 * - Performance optimized with useCallback
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ Load language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("farmconnect_language") || "en";
      
      // Validate language is supported
      if (!["en", "hi", "mr"].includes(savedLanguage)) {
        localStorage.setItem("farmconnect_language", "en");
        setLanguage("en");
        document.documentElement.lang = "en";
      } else {
        setLanguage(savedLanguage);
        document.documentElement.lang = savedLanguage;
      }
    } catch (error) {
      console.error("❌ Failed to load language preference:", error);
      setLanguage("en");
      document.documentElement.lang = "en";
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ✅ Change language with validation and persistence
  const changeLanguage = useCallback((lang) => {
    try {
      if (!["en", "hi", "mr"].includes(lang)) {
        console.warn(`⚠️ Unsupported language: ${lang}. Defaulting to English.`);
        return;
      }

      setLanguage(lang);
      localStorage.setItem("farmconnect_language", lang);
      document.documentElement.lang = lang;
      
      // Optional: Track language change in analytics
      if (window.gtag) {
        window.gtag("event", "language_changed", { language: lang });
      }
    } catch (error) {
      console.error("❌ Failed to change language:", error);
    }
  }, []);

  // ✅ Safe translation getter with fallback
  const t = useCallback((section, key) => {
    try {
      const translation = translations[language]?.[section]?.[key];
      
      if (translation) {
        return translation;
      }

      // ✅ Smart fallback: key -> English fallback
      const englishTranslation = translations["en"]?.[section]?.[key];
      if (englishTranslation) {
        console.warn(`⚠️ Missing translation: ${language}.${section}.${key} - Using English fallback`);
        return englishTranslation;
      }

      // Last resort: return key itself
      console.warn(`❌ Translation not found: ${language}.${section}.${key}`);
      return key;
    } catch (error) {
      console.error(`❌ Translation error: ${error.message}`);
      return key;
    }
  }, [language]);

  // ✅ Get full section for advanced use cases
  const getTranslations = useCallback((section) => {
    try {
      return translations[language]?.[section] || translations["en"]?.[section] || {};
    } catch (error) {
      console.error(`❌ Failed to get translations for ${section}:`, error);
      return {};
    }
  }, [language]);

  // ✅ Get all supported languages metadata
  const getSupportedLanguages = useCallback(() => {
    return [
      { code: "en", name: "English", label: "EN", nativeName: "English" },
      { code: "hi", name: "Hindi", label: "HI", nativeName: "हिंदी" },
      { code: "mr", name: "Marathi", label: "MR", nativeName: "मराठी" },
    ];
  }, []);

  const contextValue = {
    language,
    changeLanguage,
    t,
    getTranslations,
    getSupportedLanguages,
    translations,
    isLoaded,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * ✅ Custom Hook to use Language Context
 * Must be used within LanguageProvider
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("🔴 useLanguage must be used within LanguageProvider");
  }
  return context;
};
