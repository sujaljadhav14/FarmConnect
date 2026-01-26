# ✅ FARMCONNECT MULTI-LANGUAGE TEST PROCEDURES
## Senior-Level QA Testing Documentation

**Date:** January 2026  
**Version:** 1.0  
**Scope:** Complete i18n/l10n testing for FarmConnect  

---

## 🎯 EXECUTIVE SUMMARY

This document provides comprehensive, senior-level test cases for the FarmConnect multi-language system supporting:
- **English (EN)**
- **Hindi (HI)**
- **Marathi (MR)**

### Key Features Tested:
✅ Language selection UI  
✅ Content translation accuracy  
✅ Persistence (localStorage, page refresh)  
✅ Navigation & routing  
✅ UI/Layout responsiveness  
✅ Performance & accessibility  
✅ Security & fallback handling  
✅ Cross-browser compatibility  

---

## 1️⃣ LANGUAGE SELECTION - FUNCTIONAL TEST CASES

### Test Case: LANG_001
**Title:** Verify language selector is visible and accessible  
**Steps:**
1. Open FarmConnect homepage
2. Locate the header navigation
3. Find the language selector buttons (EN, HI, MR)

**Expected Result:**
- [ ] Language selector clearly visible in header (top-right)
- [ ] Three buttons for EN, HI, MR are present
- [ ] Buttons are clickable and not disabled
- [ ] Language names appear in tooltips on hover

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_002
**Title:** Verify default language loads correctly  
**Steps:**
1. Clear browser localStorage: `localStorage.clear()`
2. Refresh the page (F5)
3. Observe the page text

**Expected Result:**
- [ ] Page loads in English by default
- [ ] All UI text is in English (no mixed language)
- [ ] "Welcome to FarmConnect" heading appears
- [ ] All buttons show English text

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_003
**Title:** Verify all languages are listed  
**Steps:**
1. Open the language selector
2. Count the available language options

**Expected Result:**
- [ ] Exactly 3 languages available: EN, HI, MR
- [ ] All languages are enabled and selectable
- [ ] Language labels are correct

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_004
**Title:** Verify no duplicate languages  
**Steps:**
1. Inspect the language selector buttons
2. List all language codes

**Expected Result:**
- [ ] No duplicate language options
- [ ] Each language appears exactly once
- [ ] No hidden/duplicate elements

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_005
**Title:** Verify disabled language cannot be selected  
**Steps:**
1. Verify EN is the current language
2. Check if EN button is disabled
3. Attempt to click EN button
4. Switch to HI language
5. Check if HI button is now disabled

**Expected Result:**
- [ ] Currently active language button is disabled
- [ ] Active button shows visual indication (darker/different style)
- [ ] Disabled button prevents re-selection
- [ ] Each language button disables only when selected

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 2️⃣ CONTENT TRANSLATION ACCURACY TEST CASES

### Test Case: LANG_010
**Title:** Verify English headings are correctly displayed  
**Steps:**
1. Set language to EN
2. Navigate to homepage
3. Check main heading text

**Expected Result:**
- [ ] Main heading: "Welcome to FarmConnect"
- [ ] Subtitle: "Connecting Farmers, Traders & Transporters"
- [ ] All text is in English
- [ ] No placeholder keys visible (e.g., not "homePage.title")

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_011
**Title:** Verify Hindi translations are accurate  
**Steps:**
1. Click HI language button
2. Wait for content to update
3. Navigate to homepage
4. Check all visible text

**Expected Result:**
- [ ] Main heading: "फार्मकनेक्ट में आपका स्वागत है"
- [ ] All text is in Hindi script (Devanagari)
- [ ] No English words mixed in (except proper nouns like "FarmConnect")
- [ ] Text layout maintains proper formatting

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_012
**Title:** Verify Marathi translations are accurate  
**Steps:**
1. Click MR language button
2. Wait for content to update
3. Check all visible text

**Expected Result:**
- [ ] Main heading: "फार्मकनेक्टमध्ये आपले स्वागत आहे"
- [ ] All text is in Marathi script
- [ ] Marathi-specific characters are correct (़, ँ, etc.)
- [ ] Text wrapping is appropriate

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_013
**Title:** Verify error messages are translated  
**Steps:**
1. Set language to EN
2. Navigate to a form (Login/Register)
3. Try to submit without required fields
4. Observe error messages
5. Repeat in HI and MR

**Expected Result:**
- [ ] EN: "This field is required"
- [ ] HI: "यह क्षेत्र आवश्यक है"
- [ ] MR: "हे क्षेत्र आवश्यक आहे"
- [ ] Error messages appear in correct language

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_014 (Senior Check)
**Title:** Verify NO mixed-language UI (multilingual pollution)  
**Steps:**
1. Set language to HI
2. Scan entire visible page
3. Look for any English text that should be translated

**Expected Result:**
- [ ] NO English words visible (except app name "FarmConnect")
- [ ] All UI text is in Hindi
- [ ] Buttons, labels, placeholders are all Hindi
- [ ] No "Loading..." in English while in Hindi mode

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_015 (Senior Check)
**Title:** Verify NO fallback English text leaks  
**Steps:**
1. Set language to MR
2. Navigate through all pages
3. Look for any untranslated English phrases
4. Check console for warnings

**Expected Result:**
- [ ] No English fallback text visible
- [ ] All keys are properly translated
- [ ] No console warnings about missing translations
- [ ] No double keys like "homePage.title" showing as text

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 3️⃣ PERSISTENCE TEST CASES (VERY IMPORTANT)

### Test Case: LANG_016
**Title:** Language preference persists after page refresh  
**Steps:**
1. Open FarmConnect homepage (EN by default)
2. Select Hindi (HI)
3. Verify page updates to Hindi
4. Press F5 to refresh page
5. Wait for page to fully load

**Expected Result:**
- [ ] Page still displays in Hindi after refresh
- [ ] Main heading still shows Hindi text
- [ ] No flash of English before switching to Hindi
- [ ] localStorage contains "farmconnect_language": "hi"

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_017
**Title:** Opening new tab retains saved language  
**Steps:**
1. In current tab: Select Marathi (MR)
2. Verify page is in Marathi
3. Open new tab: `Ctrl+T` (Windows) or `Cmd+T` (Mac)
4. Navigate to FarmConnect homepage

**Expected Result:**
- [ ] New tab also opens in Marathi
- [ ] Language preference is shared across tabs
- [ ] No need to re-select language

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_018
**Title:** Browser restart preserves language preference  
**Steps:**
1. Select Hindi language
2. Close browser completely (all windows)
3. Reopen browser
4. Navigate to FarmConnect

**Expected Result:**
- [ ] FarmConnect loads in Hindi (if designed to persist across sessions)
- [ ] Language preference survives browser restart
- [ ] No need to reselect language

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_019
**Title:** HTML lang attribute updated correctly  
**Steps:**
1. Open page in EN
2. Inspect HTML: `document.documentElement.lang`
3. Switch to HI
4. Check lang attribute again
5. Repeat for MR

**Expected Result:**
- [ ] EN: `document.documentElement.lang = "en"`
- [ ] HI: `document.documentElement.lang = "hi"`
- [ ] MR: `document.documentElement.lang = "mr"`
- [ ] Attribute updates immediately on language switch

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 4️⃣ NAVIGATION & ROUTING TEST CASES

### Test Case: LANG_020
**Title:** Language persists during navigation  
**Steps:**
1. Set language to HI
2. Navigate to different pages:
   - Home → Login
   - Home → Register
   - Home → Dashboard
3. Check language after each navigation

**Expected Result:**
- [ ] Language remains HI on all pages
- [ ] No automatic reset to English
- [ ] All page content in Hindi

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_021
**Title:** Deep link access preserves language  
**Steps:**
1. Set language to MR
2. Copy current URL
3. Open new tab
4. Paste URL directly
5. Observe page load

**Expected Result:**
- [ ] Page loads in Marathi (if URL contains language param or localStorage exists)
- [ ] Language is not reset to default
- [ ] All content displays in MR

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_022
**Title:** Browser back/forward preserves language  
**Steps:**
1. Start in EN
2. Navigate to multiple pages while in EN
3. Switch to HI
4. Navigate to a page while in HI
5. Use browser back button
6. Use browser forward button

**Expected Result:**
- [ ] Language remains HI after back/forward
- [ ] No reset to previous page's language
- [ ] History navigation smooth

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 5️⃣ UI & LAYOUT TEST CASES (CRITICAL)

**Note:** Languages vary significantly in text length:
- English: Average length baseline
- Hindi: 15-25% longer
- Marathi: 15-25% longer

### Test Case: LANG_023
**Title:** Long text language doesn't cause UI overflow  
**Steps:**
1. Set language to HI (longer than English)
2. Check all buttons with text
3. Check all form labels
4. Check all navigation items
5. Resize window to different widths (mobile, tablet, desktop)

**Expected Result:**
- [ ] NO text overflow or truncation
- [ ] Buttons auto-expand to fit content
- [ ] No text hidden behind other elements
- [ ] Proper word wrapping on mobile

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_024
**Title:** Buttons auto-resize for different languages  
**Steps:**
1. Take screenshot of buttons in EN
2. Switch to HI
3. Observe button widths
4. Measure button sizes

**Expected Result:**
- [ ] Buttons expand/contract based on text length
- [ ] Button heights consistent
- [ ] Text is never cut off
- [ ] Spacing remains balanced

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_025
**Title:** Menu items don't overlap  
**Steps:**
1. Set language to HI
2. Open navbar/menu
3. Check spacing between items
4. Resize window to 320px (mobile)
5. Check menu collapse behavior

**Expected Result:**
- [ ] Menu items have proper spacing
- [ ] No overlapping text
- [ ] Mobile menu collapses appropriately
- [ ] Hamburger menu works with all languages

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_026
**Title:** Mobile view maintains clean layout  
**Steps:**
1. Open DevTools (F12)
2. Set device to iPhone 12
3. Switch through all languages (EN, HI, MR)
4. Scroll through entire page

**Expected Result:**
- [ ] Text fits within viewport (no horizontal scroll)
- [ ] Images responsive
- [ ] Forms properly aligned
- [ ] Buttons easily tappable (48px minimum)
- [ ] No layout shift when language changes

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 6️⃣ PERFORMANCE TEST CASES

### Test Case: LANG_027
**Title:** Language switch completes in < 500ms  
**Steps:**
1. Open DevTools → Performance tab
2. Select language
3. Record performance metrics
4. Note time until content updates

**Expected Result:**
- [ ] Content visible within 500ms
- [ ] No lag or flicker
- [ ] Smooth transition
- [ ] No jank or stuttering

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_028
**Title:** No memory leak on repeated language changes  
**Steps:**
1. Open DevTools → Memory tab
2. Take heap snapshot (baseline)
3. Switch languages 50 times rapidly
4. Take heap snapshot (after)
5. Compare memory usage

**Expected Result:**
- [ ] Memory usage stable
- [ ] No significant increase after 50 changes
- [ ] Garbage collection working properly
- [ ] No orphaned objects in memory

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 7️⃣ ACCESSIBILITY TEST CASES

### Test Case: LANG_029
**Title:** Language buttons have keyboard accessibility  
**Steps:**
1. Tab through page using keyboard
2. Navigate to language buttons
3. Use Arrow keys to move between buttons
4. Press Enter to select

**Expected Result:**
- [ ] Language buttons receive focus (visible outline)
- [ ] Can navigate with Tab key
- [ ] Can select with Enter or Space key
- [ ] Focus order is logical

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_030
**Title:** Screen reader announces language change  
**Steps:**
1. Install screen reader (NVDA on Windows, VoiceOver on Mac)
2. Navigate to language selector
3. Switch language
4. Listen to announcements

**Expected Result:**
- [ ] Screen reader announces language name
- [ ] Button purpose is clear ("Select English", "Select Hindi")
- [ ] Page language change is announced
- [ ] Content is re-announced in new language

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 8️⃣ SECURITY TEST CASES

### Test Case: LANG_031
**Title:** Tampered language code doesn't crash app  
**Steps:**
1. Open DevTools Console
2. Run: `localStorage.setItem("farmconnect_language", "<script>alert('xss')</script>")`
3. Refresh page
4. Observe app behavior

**Expected Result:**
- [ ] App loads without error
- [ ] No script injection occurs
- [ ] Defaults to English safely
- [ ] No console errors

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_032
**Title:** Invalid language parameter is ignored  
**Steps:**
1. Attempt to select unsupported language programmatically
2. Try language codes like "xx", "12", "@#$"
3. Observe behavior

**Expected Result:**
- [ ] Invalid language is rejected
- [ ] Current language unchanged
- [ ] No error in console
- [ ] App continues to function

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 9️⃣ CROSS-BROWSER & DEVICE TEST CASES

### Test Case: LANG_033
**Title:** Chrome browser - All languages work  
**Steps:**
1. Open Chrome
2. Navigate to FarmConnect
3. Test all three languages
4. Clear cache/cookies and test again

**Expected Result:**
- [ ] All languages work correctly in Chrome
- [ ] Persistence works with Chrome
- [ ] No layout issues

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_034
**Title:** Firefox browser - All languages work  
**Steps:**
1. Open Firefox
2. Repeat LANG_033 steps

**Expected Result:**
- [ ] All languages work correctly in Firefox
- [ ] localStorage works properly
- [ ] No rendering issues

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_035
**Title:** Edge browser - All languages work  
**Steps:**
1. Open Edge
2. Repeat LANG_033 steps

**Expected Result:**
- [ ] All languages work correctly in Edge
- [ ] No Edge-specific issues

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_036
**Title:** iOS Safari - All languages work  
**Steps:**
1. Open Safari on iPhone/iPad
2. Navigate to FarmConnect
3. Test all languages
4. Close and reopen (persistence check)

**Expected Result:**
- [ ] All languages display correctly
- [ ] Touch controls work
- [ ] Persistence works on iOS
- [ ] No layout issues on mobile Safari

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_037
**Title:** Android Chrome - All languages work  
**Steps:**
1. Open Chrome on Android
2. Repeat language tests
3. Test on various screen sizes

**Expected Result:**
- [ ] All languages work on Android
- [ ] Touch targets appropriately sized
- [ ] Responsive layout works
- [ ] localStorage persistence works

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 🔟 FALLBACK & ERROR HANDLING TEST CASES

### Test Case: LANG_038
**Title:** Missing translation key shows graceful fallback  
**Steps:**
1. Create scenario where translation key doesn't exist
2. Observe fallback behavior

**Expected Result:**
- [ ] Shows key name, not blank
- [ ] English fallback loads if available
- [ ] App doesn't crash
- [ ] Console shows warning (dev mode)

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

### Test Case: LANG_039
**Title:** Corrupted localStorage handled gracefully  
**Steps:**
1. Open DevTools
2. Run: `localStorage.setItem("farmconnect_language", "{corrupted")`
3. Refresh page

**Expected Result:**
- [ ] App loads in default English
- [ ] No error shown to user
- [ ] localStorage is corrected/cleared
- [ ] No console errors

**Actual Result:** _______________  
**Status:** ☐ PASS ☐ FAIL  
**Notes:** _______________

---

## 🔐 SENIOR ENGINEER CHECKLIST

Before marking testing complete, verify:

- [ ] **No Mixed Language** - No English words in Hindi/Marathi UI (except app name)
- [ ] **Language Persists** - Setting saved, survives refresh, new tabs
- [ ] **No Layout Break** - Long text doesn't overflow, buttons resize
- [ ] **No Performance Lag** - Language switch < 500ms
- [ ] **Accessible** - Keyboard navigation, screen readers work
- [ ] **Secure Fallback** - Invalid languages rejected, no injection
- [ ] **All Browsers** - Tested Chrome, Firefox, Edge, Safari, Android
- [ ] **Error Handling** - Missing keys don't crash, graceful fallbacks
- [ ] **Mobile** - Tested on iPhone and Android
- [ ] **Console Clean** - No errors or warnings (production build)

---

## 📊 TEST SUMMARY

**Total Test Cases:** 39  
**Functional:** 15  
**Translation:** 8  
**Persistence:** 4  
**Navigation:** 3  
**UI/Layout:** 4  
**Performance:** 2  
**Accessibility:** 2  
**Security:** 2  
**Cross-Browser:** 5  
**Error Handling:** 2  

**Date Tested:** _______________  
**Tester Name:** _______________  
**Build Version:** _______________  
**Test Environment:** _______________  

**Overall Result:** ☐ PASS ☐ FAIL  
**Issues Found:** _______________  

---

## 🚀 NOTES FOR QA

1. **Test in real conditions** - Use actual users' devices, not just emulators
2. **Check script/CSS** - Ensure no hardcoded English in CSS content
3. **Verify fonts** - Ensure Hindi/Marathi fonts display correctly
4. **Check RTL support** - If adding Arabic later, test RTL layout
5. **API responses** - Verify server responses are also translated
6. **Email notifications** - Check if emails respect language preference
7. **Push notifications** - Ensure notifications in correct language
8. **Documentation** - Verify help docs are translated

---

**END OF TEST PROCEDURES**
