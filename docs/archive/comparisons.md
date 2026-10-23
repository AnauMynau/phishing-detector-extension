# System and Technology Comparisons

## 1. Existing Systems Comparison

| Criteria | Google Safe Browsing | Netcraft Extension | PhishTank | VirusTotal Extension | Our Proposed Solution |
|---|---|---|---|---|---|
| **Primary Method** | Blacklist + Cloud ML | Blacklist + Heuristics | Community Blacklist | Multi-engine aggregation | Local Heuristics + ML indicators |
| **Explainability (XAI)** | None (Generic red warning) | Low (Risk rating score only) | None (Community votes) | Low (Antivirus detection ratio) | **High (Clear list of specific threat indicators)** |
| **Zero-Day Protection** | Moderate (Cloud delay) | Low (Signature-based) | Low (Requires verification) | Moderate | **High (Instant heuristic/DOM analysis)** |
| **Privacy (URL Leak)** | Hash-prefix lookup | Full URL sent to server | URL submitted publicly | Full URL sent to cloud | **High (Client-side inspection, no URL leak)** |
| **Latency Overhead** | Low (Hash cache) | Moderate (Cloud check) | High (Manual query) | High (Multi-scanner wait) | **Low (<150 ms in browser sandbox)** |
| **Warning Delivery** | Blocking page | Toolbar popup | Web portal | Browser popup | **Interactive non-blocking overlay/popup** |
| **Platform Integration** | Native Chromium | Browser extension | Web API | Browser extension | **Chromium Manifest V3 extension** |

---

## 2. Technology Comparison & Selection

### Decision 1: Extension Architecture
- **Option A (Chosen): Chrome Manifest V3 (TypeScript / Vanilla JS)**
  - *Pros:* Mandatory for Chrome Web Store, high security, non-persistent background service worker saves RAM.
  - *Cons:* No arbitrary code evaluation (`eval`), background script terminates when idle.
- **Option B: Chrome Manifest V2**
  - *Pros:* Persistent background page, easier debugging.
  - *Cons:* Deprecated and disabled in current Chromium browsers.
- **Option C: Electron Desktop Wrapper**
  - *Pros:* Full access to system resources and Node.js runtime.
  - *Cons:* Heavyweight, cannot natively embed inside user's existing Chrome/Edge workflow.
- **Justification:** Manifest V3 is the modern, secure standard for Chromium extensions.

### Decision 2: Detection and Explainability Engine
- **Option A (Chosen): Hybrid Pipeline (Client-side DOM/URL Heuristics + Lightweight ONNX Web / Rule-based XAI)**
  - *Pros:* Zero network latency, absolute user privacy (no browsing data leaves the machine), instant explanation generation.
  - *Cons:* Limited model complexity to keep memory usage low.
- **Option B: Full Cloud Backend API (Python FastAPI + XGBoost/SHAP)**
  - *Pros:* Can run heavy ML models and complex SHAP calculations.
  - *Cons:* Sends full user browsing history to an external server (privacy violation) and introduces network latency.
- **Option C: Static Regex / Blacklist file**
  - *Pros:* Minimal footprint.
  - *Cons:* Cannot detect zero-day phishing or obfuscated forms.
- **Justification:** The hybrid local pipeline guarantees privacy, minimal latency (<150ms), and easy rule-to-text explanation mapping.

### Decision 3: Local Storage & Caching
- **Option A (Chosen): `chrome.storage.local` + IndexedDB**
  - *Pros:* Native browser API, asynchronous, fast key-value lookups for domain whitelist and cached scan results.
  - *Cons:* Storage size limits (manageable for our metadata).
- **Option B: SQLite compiled to WebAssembly (WASM)**
  - *Pros:* Powerful relational queries.
  - *Cons:* Unnecessary binary bundle overhead for simple key-value lookups.
- **Justification:** `chrome.storage.local` provides sufficient performance without increasing extension bundle size.