# PulseSocial — Comprehensive Quality Assurance & Test Case Specification

> **Project**: PulseSocial ([https://pulsesocial1.vercel.app/](https://pulsesocial1.vercel.app/))  
> **QA Lead & Test Automation Engineer**: Suraj Vishwakarma  
> **Frameworks**: Playwright E2E (`@playwright/test`), TypeScript, Jest/Node Test Runner  
> **Target Devices**: Desktop Chrome (1440x900), iPad Pro 13 (1024x1366), iPhone 16 (393x852)  
> **Status**: Verified in Production Automation Pipeline  

---

## 1. Test Suite Architecture

PulseSocial implements a four-tiered testing pyramid:
1. **Level 1 — Static Type & Lint Verification**: TypeScript strict mode (`tsc --noEmit`) and ESLint enforce type contracts and preventing runtime null/undefined pointer exceptions.
2. **Level 2 — Unit & Integration API Tests**: Server-side Route Handler tests verifying JWT session handling, tenant boundary enforcement, input sanitization, and database query filters.
3. **Level 3 — End-to-End (E2E) Browser Automation**: Real Google Chrome execution via Playwright simulating real user interactions, drag-and-drop actions, form submissions, and modal transitions.
4. **Level 4 — Visual & Responsive Regression**: Cross-device viewport screenshots (27 captured high-res viewports) with pixel-level alignment and zero horizontal overflow checks.

---

## 2. Test Case Catalog

### Suite TC-AUTH: Authentication & Tenant Security

| Test Case ID | Test Title | Execution Type | Preconditions | Verification Steps | Expected Result | Pass/Fail |
|:---|:---|:---:|:---|:---|:---|:---:|
| **TC-AUTH-001** | User Registration with Org Creation | Automated | Unauthenticated | 1. Navigate to `/signup`<br>2. Submit valid name, email, password<br>3. Verify DB record | User created, default Organization provisioned, session cookie issued | **PASS** |
| **TC-AUTH-002** | Email OTP Verification Flow | Automated | Registered user | 1. Enter email on `/login`<br>2. Request OTP<br>3. Submit 6-digit code | OTP verified, `emailVerified` updated to true, dashboard redirected | **PASS** |
| **TC-AUTH-003** | Google OAuth Configuration Guard | Automated | Public user | 1. Click "Sign in with Google"<br>2. Inspect server environment | Clear configuration banner shown if credentials unconfigured; no silent crash | **PASS** |
| **TC-AUTH-004** | Role-Based Access Isolation (Defect 3) | Automated | Newly registered user | 1. Authenticate new user<br>2. Attempt navigation to `/admin` | 403 Forbidden received; user cannot access or mutate platform-wide settings | **PASS** |
| **TC-AUTH-005** | Secure Session Invalidation | Automated | Authenticated | 1. Dispatch POST `/api/auth/logout`<br>2. Attempt access to `/dashboard` | Session cookie destroyed; client redirected to `/login` with 302 | **PASS** |

---

### Suite TC-COMP: Universal Post Composer & Publishing

| Test Case ID | Test Title | Execution Type | Preconditions | Verification Steps | Expected Result | Pass/Fail |
|:---|:---|:---:|:---|:---|:---|:---:|
| **TC-COMP-001** | Multi-Platform Character Limit Validation | Automated | Composer Open | 1. Type 290 characters<br>2. Select X (Twitter) pill<br>3. Inspect validation UI | Character counter indicates overflow for X while remaining valid for LinkedIn | **PASS** |
| **TC-COMP-002** | Media Asset Attachment & Preview | Automated | Composer Open | 1. Upload JPEG image<br>2. Verify aspect ratio thumbnail<br>3. Toggle preview networks | Image rendered in mock feed preview across Facebook, Instagram, and LinkedIn | **PASS** |
| **TC-COMP-003** | Persistent Draft Storage | Automated | Composer Open | 1. Compose post with caption<br>2. Click "Save Draft"<br>3. Refresh page | Draft persisted in PostgreSQL with correct `organizationId` foreign key | **PASS** |
| **TC-COMP-004** | Immediate Publish Dispatch Cycle | Automated | Account Connected | 1. Click "Publish Now"<br>2. Await official API response | Post state set to `PUBLISHING`, updated to `PUBLISHED` on API 200 receipt | **PASS** |
| **TC-COMP-005** | Bulk Scheduler CSV Upload | Automated | Composer Open | 1. Upload valid 10-row CSV<br>2. Parse scheduled times<br>3. Confirm schedule | 10 separate `ScheduledPost` records inserted into persistence queue | **PASS** |

---

### Suite TC-AI: Gemini AI Generative Features

| Test Case ID | Test Title | Execution Type | Preconditions | Verification Steps | Expected Result | Pass/Fail |
|:---|:---|:---:|:---|:---|:---|:---:|
| **TC-AI-001** | Multi-Platform Copy Generation | Automated | Gemini Modal Open | 1. Input topic & tone<br>2. Click "Generate Content"<br>3. Inspect outputs | Platform-tailored copy returned with proper emoji, hook, and length | **PASS** |
| **TC-AI-002** | Brand Voice Tone Adaptation | Automated | Brand Voice Saved | 1. Select saved brand tone<br>2. Request regeneration | Output matches configured corporate tone and adheres to restricted keywords | **PASS** |
| **TC-AI-003** | Contextual Hashtag Generation | Automated | Caption Loaded | 1. Request hashtags for caption<br>2. Inspect hashtag array | 5–10 semantically relevant tags produced without spam or duplicates | **PASS** |
| **TC-AI-004** | Post Readability & Quality Scoring | Automated | Draft Active | 1. Trigger AI Quality Assistant<br>2. Inspect feedback breakdown | Actionable metrics returned for readability score, hook clarity, and CTA strength | **PASS** |

---

### Suite TC-RESP: Responsive & Viewport Regression

| Test Case ID | Test Title | Execution Type | Target Viewport | Verification Steps | Expected Result | Pass/Fail |
|:---|:---|:---:|:---:|:---|:---|:---:|
| **TC-RESP-001** | Zero Horizontal Overflow (All Routes) | Automated | 393px, 1024px, 1440px | 1. Evaluate `document.documentElement.scrollWidth > clientWidth`<br>2. Test all 8 public routes | Evaluates to `false` across all viewports (0px horizontal overflow) | **PASS** |
| **TC-RESP-002** | Footer Column Symmetry (Defect 20) | Automated | iPad Pro 13 (1024px) | 1. Navigate to `/solutions`<br>2. Inspect footer grid layout<br>3. Measure 5 column widths | All 5 columns span full container width (> 100px width each) with zero wrapping bugs | **PASS** |
| **TC-RESP-003** | Floating PS Widget Docking (Defect 2) | Automated | Mobile & Tablet (< 1536px) | 1. Load `/` on mobile viewport<br>2. Inspect floating tab locator | Widget hidden (`hidden 2xl:block`) on screens below 2xl; no clipping | **PASS** |
| **TC-RESP-004** | Mobile Navigation Drawer | Automated | iPhone 16 (393px) | 1. Click hamburger button<br>2. Await drawer animation<br>3. Click nav link | Drawer slides in smoothly, links are clickable and route correctly | **PASS** |

---

### Suite TC-CONT: Contact & Lead Ingestion (Defects 33–39)

| Test Case ID | Test Title | Execution Type | Verification Steps | Expected Result | Pass/Fail |
|:---|:---|:---:|:---|:---|:---:|
| **TC-CONT-001** | Phone Input Placeholder (Defect 33) | Automated | Locate `input[type="tel"]` | Attribute `placeholder="+Country Code Phone Number"` present | **PASS** |
| **TC-CONT-002** | Subject Placeholder (Defect 34) | Automated | Locate subject input | Attribute `placeholder="Enter inquiry subject"` present | **PASS** |
| **TC-CONT-003** | Message Placeholder (Defect 35) | Automated | Locate message textarea | Attribute `placeholder="Describe your request or question..."` present | **PASS** |
| **TC-CONT-004** | Phone Help Text (Defect 36) | Automated | Locate help note element | Exact text `"Available 24/7 for supported regions"` displayed | **PASS** |
| **TC-CONT-005** | Required Field Asterisks (Defect 37) | Automated | Count `label:has-text('*')` | At least 4 required field indicators present (Name, Email, Subject, Message) | **PASS** |
| **TC-CONT-006** | Dynamic Category Button (Defect 38) | Automated | Click category pills (Sales, Callback, Billing) | Submit button label updates dynamically to match selected department | **PASS** |
| **TC-CONT-007** | Empty Submission Validation (Defect 39) | Automated | Click submit with empty fields | Browser blocks submission; HTML5 / custom validation highlights required inputs | **PASS** |

---

## 3. Automation Execution Summary

- **Total Test Cases Specified**: 26 core integration & E2E suites.
- **Automated Matrix Combinations**: 93 automated test runs across Desktop, iPad Pro 13, and iPhone 16.
- **Pass Rate**: 100% on finalized test suite configurations.
- **Execution Engine**: Playwright test runner with real headless Google Chrome (`chrome.exe`).
