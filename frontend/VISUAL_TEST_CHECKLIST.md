# 🧪 VISUAL TEST EXECUTION GUIDE

## Quick Reference for QA Teams

Print this page and check off as you test!

---

## ✅ PRE-TEST CHECKLIST

Before starting tests:
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] localStorage cleared (DevTools → Application → Clear All)
- [ ] Browser console open (F12)
- [ ] Desktop view at 100% zoom
- [ ] DevTools responsive mode ready
- [ ] Screen reader installed (optional but recommended)

---

## 🚀 QUICK SMOKE TEST (2 minutes)

| # | Test | Expected | Pass/Fail | Notes |
|---|------|----------|-----------|-------|
| 1 | Open app | Homepage visible | ☐ | |
| 2 | Click EN | Page in English | ☐ | "Welcome to FarmConnect" |
| 3 | Click HI | Page in Hindi | ☐ | "फार्मकनेक्ट में आपका स्वागत है" |
| 4 | Click MR | Page in Marathi | ☐ | "फार्मकनेक्टमध्ये आपले स्वागत आहे" |
| 5 | Refresh (F5) | Language persists | ☐ | Should still be Marathi |

**Result:** ☐ PASS ☐ FAIL

---

## 🌐 LANGUAGE SELECTION TESTS

### Test Set 1: Visibility & Accessibility

| Test ID | Test Case | Steps | Expected | Status |
|---------|-----------|-------|----------|--------|
| LANG_001 | Buttons visible | Look at header | 3 buttons (EN, HI, MR) | ☐ |
| LANG_002 | Buttons clickable | Click each | No errors, page changes | ☐ |
| LANG_003 | Keyboard access | Tab to buttons, Enter | Language changes | ☐ |
| LANG_004 | Hover tooltips | Hover over buttons | Tooltips show | ☐ |
| LANG_005 | Active indication | Select HI | Button appears selected | ☐ |

**Section Result:** ☐ PASS ☐ FAIL

---

## 📝 TRANSLATION ACCURACY TESTS

### Test Set 2: Content Translation

| Language | Home Title | Subtitle | Buttons | Status |
|----------|-----------|----------|---------|--------|
| EN | "Welcome..." | "Connecting..." | English | ☐ |
| HI | "फार्मकनेक्ट में..." | "किसान, व्यापारी..." | हिंदी | ☐ |
| MR | "फार्मकनेक्टमध्ये..." | "शेतकरी, व्यापारी..." | मराठी | ☐ |

### Checks for Each Language:
- [ ] No English text mixed in
- [ ] All UI elements translated
- [ ] Proper character rendering (no boxes/garbled text)
- [ ] Text doesn't overflow buttons
- [ ] Error messages translated

**Section Result:** ☐ PASS ☐ FAIL

---

## 💾 PERSISTENCE TESTS

### Test Set 3: Language Saved & Restored

| # | Action | Expected | Status | Notes |
|---|--------|----------|--------|-------|
| 1 | Select HI | Page in Hindi | ☐ | |
| 2 | Refresh (F5) | Still Hindi | ☐ | Language persisted |
| 3 | Open DevTools Console | Run: `localStorage.getItem("farmconnect_language")` | Returns "hi" | ☐ | |
| 4 | Close tab completely | N/A | ☐ | |
| 5 | Reopen app | Should be Hindi | ☐ | Storage persists |
| 6 | Switch to MR | Page in Marathi | ☐ | |
| 7 | Open new tab | Navigate to app | Should be Marathi | ☐ | Shared storage |

**Section Result:** ☐ PASS ☐ FAIL

---

## 📱 RESPONSIVE DESIGN TESTS

### Test Set 4: Mobile & Tablet Views

| Device | Resolution | Test | Status | Issues |
|--------|-----------|------|--------|--------|
| iPhone | 375×812 | Buttons fit? | ☐ | |
| | | Text readable? | ☐ | |
| | | No horizontal scroll? | ☐ | |
| Tablet | 768×1024 | Layout works? | ☐ | |
| | | Buttons properly sized? | ☐ | |
| Desktop | 1920×1080 | Optimal display? | ☐ | |

**How to test:**
1. Open DevTools (F12)
2. Click device icon (Ctrl+Shift+M)
3. Select device from dropdown
4. Test each language

**Section Result:** ☐ PASS ☐ FAIL

---

## ⚡ PERFORMANCE TESTS

### Test Set 5: Speed & Efficiency

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Switch EN→HI | Instant (< 1 sec) | ☐ |
| 2 | Switch HI→MR | Instant (< 1 sec) | ☐ |
| 3 | Rapid clicking (10 times) | No crash/freeze | ☐ |
| 4 | Open DevTools Memory | No memory leak | ☐ |

**DevTools Performance Check:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Click record
4. Switch languages 5 times
5. Stop recording
6. Check for jank/stuttering

**Section Result:** ☐ PASS ☐ FAIL

---

## ♿ ACCESSIBILITY TESTS

### Test Set 6: Keyboard & Screen Reader

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| 1 | Keyboard Nav | Tab through page | Can reach language buttons | ☐ |
| 2 | Button Focus | Tab to buttons | Blue focus ring visible | ☐ |
| 3 | Select via Keyboard | Press Enter/Space on button | Language changes | ☐ |
| 4 | aria-labels | Inspect with F12 | Buttons have aria-labels | ☐ |
| 5 | lang attribute | Check HTML | `<html lang="hi">` etc | ☐ |

**Screen Reader Test (Optional):**
- Windows: NVDA (free) or JAWS
- Mac: VoiceOver (built-in)
- Android: TalkBack
- iOS: VoiceOver

**Section Result:** ☐ PASS ☐ FAIL

---

## 🔒 SECURITY TESTS

### Test Set 7: Injection & Validation

| # | Test | Action | Expected | Status |
|---|------|--------|----------|--------|
| 1 | Invalid language | Try to select "xx" | Rejected/no effect | ☐ |
| 2 | XSS attempt | Run in console: | App still works, no alert | ☐ |
| | | `localStorage.setItem("farmconnect_language", "<script>alert('xss')</script>")` | | |
| | | Refresh page | | ☐ |
| 3 | Clear storage | Run: `localStorage.clear()` | App defaults to EN | ☐ |
| 4 | Corrupted data | Set: `localStorage.farmconnect_language = "corrupted"` | Gracefully handled | ☐ |

**Console Check:**
- F12 → Console tab
- Should show NO errors
- May show warnings (ok)

**Section Result:** ☐ PASS ☐ FAIL

---

## 🌍 CROSS-BROWSER TESTS

### Test Set 8: Multiple Browsers

| Browser | Version | EN Works | HI Works | MR Works | Status |
|---------|---------|----------|----------|----------|--------|
| Chrome | Latest | ☐ | ☐ | ☐ | ☐ |
| Firefox | Latest | ☐ | ☐ | ☐ | ☐ |
| Safari | Latest | ☐ | ☐ | ☐ | ☐ |
| Edge | Latest | ☐ | ☐ | ☐ | ☐ |

**What to check in each browser:**
- [ ] Buttons visible
- [ ] Language switches work
- [ ] Text displays correctly
- [ ] No console errors
- [ ] Mobile view responsive

**Section Result:** ☐ PASS ☐ FAIL

---

## 🍎 MOBILE OS TESTS

### Test Set 9: iOS & Android

| Device | Test | Expected | Status |
|--------|------|----------|--------|
| iPhone | Languages switch | All work smoothly | ☐ |
| | Persistence | Language saved | ☐ |
| | Landscape mode | Layout adapts | ☐ |
| Android | Languages switch | All work smoothly | ☐ |
| | Touch targets | Easy to tap | ☐ |
| | Back button | Navigation works | ☐ |

**How to test on Android/iOS:**
- Use actual device or emulator
- Test on real 4G/LTE connection
- Try in offline mode

**Section Result:** ☐ PASS ☐ FAIL

---

## 🧪 ERROR HANDLING TESTS

### Test Set 10: Edge Cases

| # | Test Case | Steps | Expected | Status |
|---|-----------|-------|----------|--------|
| 1 | Missing translation | Try to use non-existent key | Shows fallback or key name | ☐ |
| 2 | Very slow network | Throttle to slow 3G | Content loads correctly | ☐ |
| 3 | No localStorage | Disable localStorage in DevTools | App still works (uses memory) | ☐ |
| 4 | Rapid refresh | Press F5 repeatedly | No data loss | ☐ |
| 5 | Logout & switch | Login, change language, logout | Language persists | ☐ |

**How to throttle network:**
1. DevTools → Network tab
2. Throttling dropdown → Slow 3G
3. Test language switch

**Section Result:** ☐ PASS ☐ FAIL

---

## 📊 SUMMARY SCORECARD

```
                     PASS    FAIL
Language Selection   [ ]     [ ]
Translation Accuracy [ ]     [ ]
Persistence          [ ]     [ ]
Responsive Design    [ ]     [ ]
Performance          [ ]     [ ]
Accessibility        [ ]     [ ]
Security             [ ]     [ ]
Cross-Browser        [ ]     [ ]
Mobile OS            [ ]     [ ]
Error Handling       [ ]     [ ]
────────────────────────────────
OVERALL              [ ]     [ ]
```

**Passing Score:** 9/10 or higher = ✅ PASS

---

## 🐛 ISSUE REPORTING TEMPLATE

When you find an issue:

```
Test Case: LANG_XXX
Issue Title: [Brief description]
Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
Browser: [Chrome/Firefox/Safari/Edge]
Device: [Desktop/Tablet/Mobile]
OS: [Windows/Mac/iOS/Android]

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots/Video:
[Attach if possible]

Console Errors:
[Any errors in DevTools console?]
```

---

## 📋 TEST SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | _____________ | ___/___/___ | _______ |
| Reviewer | _____________ | ___/___/___ | _______ |
| Approver | _____________ | ___/___/___ | _______ |

---

## 🎯 TEST VERDICT

**Total Tests:** 50+  
**Tests Passed:** _____  
**Tests Failed:** _____  
**Pass Rate:** _____%  

### Overall Assessment:
☐ **APPROVED FOR PRODUCTION**  
☐ **APPROVED WITH NOTES**  
☐ **REJECTED - NEEDS FIXES**  

### Notes:
_________________________________________

---

## 📞 HELPFUL COMMANDS

### Quick Debug Commands (Copy-Paste into Console)

```javascript
// Quick status check
FarmConnectI18nDebug.checkCurrentLanguage()

// Full diagnostic report
FarmConnectI18nDebug.generateReport()

// Check localStorage health
FarmConnectI18nDebug.checkLocalStorageHealth()

// Measure performance
FarmConnectI18nDebug.measureLanguageSwitchPerformance()

// Reset to English
FarmConnectI18nDebug.resetLanguageData()
```

### Browser DevTools Shortcuts

| Action | Keyboard |
|--------|----------|
| Open DevTools | F12 |
| Open Console | F12 → Console |
| Clear Cache | Ctrl+Shift+Delete |
| Device Mode | Ctrl+Shift+M |
| Performance Record | F12 → Performance |
| Network Throttle | F12 → Network |

---

## ✅ FINAL CHECKLIST BEFORE DEPLOYMENT

- [ ] All 39 unit tests pass (`npm test -- i18n.test.js`)
- [ ] All 10 test sets above completed
- [ ] Zero critical issues found
- [ ] Documentation reviewed
- [ ] Performance benchmarks met
- [ ] Security checks passed
- [ ] Accessibility verified
- [ ] Mobile devices tested
- [ ] Cross-browser testing done
- [ ] Sign-off received

**Status:** ☐ READY TO DEPLOY ☐ NEEDS FIXES

---

**Test Execution Date:** ________________  
**Tester Name:** ________________  
**Result:** ☐ PASS ☐ FAIL  

---

**Good luck with testing! 🚀**
