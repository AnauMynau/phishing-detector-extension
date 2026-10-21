# Project Management and Risk Assessment

## 1. Team Responsibilities

| Team Member | Role | Key Deliverables |
|---|---|---|
| **Inayatulla Noyan** | System Architect & Extension Developer | Core architecture, Manifest V3 Service Worker, DOM/URL feature extraction engine, Git/YouTrack coordination |
| **Nurtilek Koblandy** | Security Analyst & UX/ML Developer | Heuristic/XAI scoring algorithm, UI/UX Popup implementation, dataset preparation, and verification benchmarks |

---

## 2. Project Milestones

- **Milestone 1 (Pre-Defense 1 - Oct 24):** Repository architecture, proposal, literature review, comparative analysis, initial prototypes, and requirements specification.
- **Milestone 2 (Pre-Defense 2 - Dec):** Complete DOM feature extractor, rule-based XAI explanation engine, and working Chrome extension package.
- **Milestone 3 (Final Pre-Defense):** Full dataset benchmarks, performance profiling, documentation completion, and diploma defense readiness.

---

## 3. Risk Management Matrix

| Risk ID | Description | Impact | Probability | Mitigation Strategy |
|---|---|---|---|---|
| **R-01** | **Manifest V3 Constraints:** Service workers terminate when idle, limiting background persistence. | Medium | High | Design stateless event-driven scripts; cache state in `chrome.storage.local`. |
| **R-02** | **DOM Inspection Latency:** Large single-page applications (SPAs) could slow down page rendering. | High | Medium | Execute inspection asynchronously during `DOMContentLoaded` and sample visible inputs only. |
| **R-03** | **False Positives on Complex Sites:** Legitimate login forms using CDN redirects might trigger alerts. | High | Medium | Implement domain whitelist caching and assign lower weights to single isolated indicators. |
| **R-04** | **Phishing Kit Evolution:** Zero-day phishing kits avoiding known lexical patterns. | Medium | High | Combine lexical URL indicators with DOM form mismatch detection. |