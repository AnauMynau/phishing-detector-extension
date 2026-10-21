# Software Requirements Specification (SRS)

## 1. Functional Requirements (FR)

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| **FR-01** | **URL Lexical & Structural Analysis** | Must Have | The extension extracts URL length, entropy, subdomain count, presence of IP address, and homoglyphs (punycode) within 30 ms of navigation. |
| **FR-02** | **DOM Form & Action Inspection** | Must Have | The content script inspects input elements on the active page. Any `<input type="password">` submitting to a mismatched foreign domain or non-HTTPS endpoint is flagged as a high-risk indicator. |
| **FR-03** | **Explainability & Risk Aggregation Engine** | Must Have | Aggregates detected indicators into a normalized risk score (0–100%) and generates a prioritized human-readable list explaining why the site is risky (e.g., "Mismatched login destination", "Suspicious character substitution"). |
| **FR-04** | **Browser Notification & Warning Overlay** | Must Have | When risk score exceeds the alert threshold (e.g., >70%), the extension updates the toolbar badge icon and displays an accessible explanation banner without breaking page layout. |
| **FR-05** | **User Whitelist / Exception Handling** | Should Have | Users can explicitly mark a domain as trusted (stored in local secure extension storage), bypassing future alert triggers for that specific origin. |
| **FR-06** | **Offline Heuristic Mode** | Should Have | Core rule-based indicators and heuristics must evaluate fully on the client side without requiring an active server connection. |

---

## 2. Non-Functional Requirements (NFR)

| ID | Category | Requirement | Acceptance Criteria |
|---|---|---|---|
| **NFR-01** | **Performance & Latency** | Lightweight execution | Total inspection and inference time must not exceed 200 ms per page load. |
| **NFR-02** | **Resource Utilization** | Low memory footprint | Extension background service worker and content scripts must consume < 50 MB RAM. |
| **NFR-03** | **Privacy & Security** | Client-side isolation | Browsing history and raw visited URLs must not be transmitted to external servers. All evaluation occurs locally. |
| **NFR-04** | **Standards Compliance** | Platform architecture | Fully compliant with Google Chrome Extensions **Manifest V3** security standards (no remote arbitrary code execution). |
| **NFR-05** | **Usability (Explainability)** | Human-understandable output | Indicators must be displayed in plain language with visual color tags (Critical / Warning / Safe) rather than raw machine learning weights. |