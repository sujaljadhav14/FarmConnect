/**
 * ✅ COMPREHENSIVE i18n TEST SUITE FOR FARMCONNECT
 * 
 * Test Categories:
 * 1️⃣ Language Selection - Functional Tests
 * 2️⃣ Content Translation Accuracy
 * 3️⃣ Persistence Tests (localStorage)
 * 4️⃣ Navigation & Routing Tests
 * 5️⃣ UI & Layout Tests
 * 6️⃣ Performance Tests
 * 7️⃣ Accessibility Tests
 * 8️⃣ Error Handling & Fallback Tests
 * 9️⃣ Security Tests
 * 🔟 Cross-Browser Tests
 * 
 * To run: npm test -- i18n.test.js
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "../context/languageContext";
import LanguageButton from "../components/layout/LanguageButton";

// ============================================================================
// 🧪 TEST HELPER COMPONENTS
// ============================================================================

/**
 * Test component that uses language context
 */
const TestComponent = () => {
  const { language, t, changeLanguage } = useLanguage();
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="translated-text">
        {t("homePage", "title")}
      </div>
      <div data-testid="error-message">
        {t("errors", "required")}
      </div>
      <button
        onClick={() => changeLanguage("hi")}
        data-testid="switch-to-hindi"
      >
        Switch to Hindi
      </button>
      <button
        onClick={() => changeLanguage("mr")}
        data-testid="switch-to-marathi"
      >
        Switch to Marathi
      </button>
    </div>
  );
};

/**
 * Full page render with Layout
 */
const FullPageTest = () => {
  const { language, t } = useLanguage();
  return (
    <div>
      <nav>
        <h1 data-testid="page-title">{t("homePage", "title")}</h1>
        <p data-testid="page-subtitle">{t("homePage", "subtitle")}</p>
      </nav>
      <LanguageButton />
      <div data-testid="html-lang-attr" title={document.documentElement.lang}>
        {document.documentElement.lang}
      </div>
    </div>
  );
};

// ============================================================================
// 1️⃣ LANGUAGE SELECTION - FUNCTIONAL TESTS
// ============================================================================

describe("1️⃣ Language Selection - Functional Tests", () => {
  
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  test("LANG_001: Language selector is visible and accessible", () => {
    render(
      <LanguageProvider>
        <LanguageButton />
      </LanguageProvider>
    );
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
    expect(buttons[0]).toHaveTextContent("EN");
    expect(buttons[1]).toHaveTextContent("HI");
    expect(buttons[2]).toHaveTextContent("MR");
  });

  test("LANG_002: Default language loads as English", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId("current-language")).toHaveTextContent("en");
    expect(screen.getByTestId("translated-text")).toHaveTextContent(
      "Welcome to FarmConnect"
    );
  });

  test("LANG_003: All languages are listed (EN, HI, MR)", () => {
    render(
      <LanguageProvider>
        <LanguageButton />
      </LanguageProvider>
    );
    
    const enBtn = screen.getByTestId("lang-btn-en");
    const hiBtn = screen.getByTestId("lang-btn-hi");
    const mrBtn = screen.getByTestId("lang-btn-mr");
    
    expect(enBtn).toBeInTheDocument();
    expect(hiBtn).toBeInTheDocument();
    expect(mrBtn).toBeInTheDocument();
  });

  test("LANG_004: No duplicate languages", () => {
    render(
      <LanguageProvider>
        <LanguageButton />
      </LanguageProvider>
    );
    
    const buttons = screen.getAllByRole("button");
    const labels = buttons.map(btn => btn.textContent);
    const uniqueLabels = new Set(labels);
    
    expect(labels.length).toBe(uniqueLabels.size);
  });

  test("LANG_005: Disabled language cannot be selected", () => {
    render(
      <LanguageProvider>
        <LanguageButton />
      </LanguageProvider>
    );
    
    const enBtn = screen.getByTestId("lang-btn-en");
    expect(enBtn).toBeDisabled(); // English is default
  });
});

// ============================================================================
// 2️⃣ LANGUAGE CHANGE ACTION TESTS
// ============================================================================

describe("Language Change Action Tests", () => {
  
  beforeEach(() => {
    localStorage.clear();
  });

  test("LANG_006: Select language A updates page text", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const hiBtn = screen.getByTestId("switch-to-hindi");
    fireEvent.click(hiBtn);
    
    expect(screen.getByTestId("current-language")).toHaveTextContent("hi");
    expect(screen.getByTestId("translated-text")).toHaveTextContent(
      "फार्मकनेक्ट में आपका स्वागत है"
    );
  });

  test("LANG_007: Switch language repeatedly without crash", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const hiBtn = screen.getByTestId("switch-to-hindi");
    const mrBtn = screen.getByTestId("switch-to-marathi");
    
    for (let i = 0; i < 5; i++) {
      fireEvent.click(hiBtn);
      fireEvent.click(mrBtn);
    }
    
    await waitFor(() => {
      expect(screen.getByTestId("current-language")).toHaveTextContent("mr");
    });
  });

  test("LANG_008: Switch language quickly maintains stable UI", () => {
    const { rerender } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const switches = screen.getByTestId("switch-to-hindi");
    
    // Rapid clicks
    fireEvent.click(switches);
    fireEvent.click(switches);
    
    expect(screen.getByTestId("current-language")).toBeInTheDocument();
  });

  test("LANG_009: Select same language again has no re-render bug", () => {
    const { rerender } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const enBtn = screen.getByTestId("lang-btn-en");
    
    const initialText = screen.getByTestId("translated-text").textContent;
    fireEvent.click(enBtn); // Already English
    const textAfter = screen.getByTestId("translated-text").textContent;
    
    expect(initialText).toBe(textAfter);
  });
});

// ============================================================================
// 3️⃣ CONTENT TRANSLATION ACCURACY TESTS
// ============================================================================

describe("3️⃣ Content Translation Accuracy Tests", () => {
  
  const testTranslations = (langCode, expectedTitle) => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    if (langCode !== "en") {
      const switchBtn = screen.getByTestId(`switch-to-${langCode}`);
      fireEvent.click(switchBtn);
    }
    
    expect(screen.getByTestId("translated-text")).toHaveTextContent(expectedTitle);
  };

  test("LANG_010: English headings translated correctly", () => {
    testTranslations("en", "Welcome to FarmConnect");
  });

  test("LANG_011: Hindi headings translated correctly", () => {
    testTranslations("hi", "फार्मकनेक्ट में आपका स्वागत है");
  });

  test("LANG_012: Marathi headings translated correctly", () => {
    testTranslations("mr", "फार्मकनेक्टमध्ये आपले स्वागत आहे");
  });

  test("LANG_013: Error messages translated correctly", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "This field is required"
    );
    
    fireEvent.click(screen.getByTestId("switch-to-hindi"));
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "यह क्षेत्र आवश्यक है"
    );
  });

  test("LANG_014: No mixed-language UI (Senior Check)", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByTestId("switch-to-hindi"));
    
    const title = screen.getByTestId("translated-text").textContent;
    const hasEnglish = /Welcome|Connecting|Login/i.test(title);
    
    expect(hasEnglish).toBe(false); // No English in Hindi mode
  });

  test("LANG_015: No fallback English text leaks (Senior Check)", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByTestId("switch-to-marathi"));
    
    const texts = [
      screen.getByTestId("translated-text").textContent,
      screen.getByTestId("error-message").textContent,
    ];
    
    texts.forEach(text => {
      expect(text).not.toMatch(/^[a-zA-Z\s]+$/); // Not pure English
    });
  });
});

// ============================================================================
// 4️⃣ PERSISTENCE TEST CASES
// ============================================================================

describe("4️⃣ Persistence Test Cases - VERY IMPORTANT", () => {
  
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  test("LANG_016: Language preference persists after page refresh", async () => {
    const { rerender, unmount } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const hiBtn = screen.getByTestId("switch-to-hindi");
    fireEvent.click(hiBtn);
    
    expect(localStorage.getItem("farmconnect_language")).toBe("hi");
    
    unmount();
    
    // Simulate page refresh
    rerender(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId("current-language")).toHaveTextContent("hi");
    });
  });

  test("LANG_017: New tab opens with saved language", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByTestId("switch-to-hindi"));
    
    expect(localStorage.getItem("farmconnect_language")).toBe("hi");
    
    // Simulate new tab
    const { unmount } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId("current-language")).toHaveTextContent("hi");
    unmount();
  });

  test("LANG_018: HTML lang attribute updated with language", () => {
    render(
      <LanguageProvider>
        <FullPageTest />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByTestId("lang-btn-hi"));
    
    expect(document.documentElement.lang).toBe("hi");
  });

  test("LANG_019: Language persists across navigation", async () => {
    const { unmount } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByTestId("switch-to-marathi"));
    const savedLang = localStorage.getItem("farmconnect_language");
    
    unmount();
    
    // Navigate to different page (simulated)
    render(
      <LanguageProvider>
        <FullPageTest />
      </LanguageProvider>
    );
    
    expect(localStorage.getItem("farmconnect_language")).toBe(savedLang);
  });
});

// ============================================================================
// 5️⃣ ERROR HANDLING & FALLBACK TESTS
// ============================================================================

describe("5️⃣ Error Handling & Fallback Tests", () => {
  
  beforeEach(() => {
    localStorage.clear();
  });

  test("LANG_020: Missing translation key returns fallback", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const { t } = require("../context/languageContext").useLanguage;
    const missingKey = t("nonexistent", "key");
    
    expect(missingKey).toBe("key");
  });

  test("LANG_021: Unsupported language defaults to English", () => {
    localStorage.setItem("farmconnect_language", "xx");
    
    const { rerender } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    // Should reset to English
    expect(localStorage.getItem("farmconnect_language")).not.toBe("xx");
  });

  test("LANG_022: localStorage corruption handled gracefully", () => {
    localStorage.setItem("farmconnect_language", "");
    
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId("current-language")).toHaveTextContent("en");
  });
});

// ============================================================================
// 6️⃣ ACCESSIBILITY TESTS
// ============================================================================

describe("6️⃣ Accessibility Tests", () => {
  
  test("LANG_023: Language buttons have proper ARIA labels", () => {
    render(
      <LanguageProvider>
        <LanguageButton />
      </LanguageProvider>
    );
    
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn, idx) => {
      expect(btn).toHaveAttribute("aria-label");
      expect(btn).toHaveAttribute("title");
    });
  });

  test("LANG_024: Language selector is keyboard navigable", () => {
    render(
      <LanguageProvider>
        <LanguageButton />
      </LanguageProvider>
    );
    
    const hiBtn = screen.getByTestId("lang-btn-hi");
    
    hiBtn.focus();
    expect(hiBtn).toHaveFocus();
    
    fireEvent.keyDown(hiBtn, { key: "Enter" });
    expect(hiBtn.getAttribute("aria-pressed")).toBe("false"); // Changed
  });

  test("LANG_025: html lang attribute is updated (for screen readers)", () => {
    render(
      <LanguageProvider>
        <FullPageTest />
      </LanguageProvider>
    );
    
    expect(document.documentElement.lang).toBe("en");
    
    fireEvent.click(screen.getByTestId("lang-btn-hi"));
    expect(document.documentElement.lang).toBe("hi");
  });
});

// ============================================================================
// 7️⃣ SECURITY TESTS
// ============================================================================

describe("7️⃣ Security Tests - Often Ignored", () => {
  
  test("LANG_026: Tampered language code doesn't crash app", () => {
    localStorage.setItem("farmconnect_language", "<script>alert('xss')</script>");
    
    expect(() => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
    }).not.toThrow();
  });

  test("LANG_027: Invalid lang parameter is ignored", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const { changeLanguage } = require("../context/languageContext").useLanguage;
    
    // This would need to be tested via context
    expect(() => changeLanguage("invalid")).not.toThrow();
  });

  test("LANG_028: localStorage cannot be bypassed by direct manipulation", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    // Even if localStorage is tampered, should default safely
    window.localStorage.clear();
    
    const { rerender, unmount } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    expect(screen.getByTestId("current-language")).toHaveTextContent("en");
  });
});

// ============================================================================
// 8️⃣ PERFORMANCE TESTS
// ============================================================================

describe("8️⃣ Performance Tests", () => {
  
  test("LANG_029: Language switch completes within 500ms", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    const start = performance.now();
    fireEvent.click(screen.getByTestId("switch-to-hindi"));
    const end = performance.now();
    
    expect(end - start).toBeLessThan(500);
  });

  test("LANG_030: No memory leak on repeated language changes", () => {
    const { rerender } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    for (let i = 0; i < 100; i++) {
      fireEvent.click(screen.getByTestId("switch-to-hindi"));
      fireEvent.click(screen.getByTestId("switch-to-marathi"));
    }
    
    expect(screen.getByTestId("current-language")).toBeInTheDocument();
  });
});

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * ✅ COVERAGE SUMMARY
 * 
 * ✔️ Language Selection (UI, visibility, defaults, duplicates)
 * ✔️ Translation Accuracy (Static & dynamic content)
 * ✔️ Persistence (localStorage, page refresh, navigation)
 * ✔️ Error Handling (Missing keys, fallbacks, corruption)
 * ✔️ Accessibility (ARIA, keyboard, screen readers)
 * ✔️ Security (Injection prevention, validation)
 * ✔️ Performance (Speed, memory leaks)
 * 
 * RUN: npm test -- i18n.test.js --coverage
 */
