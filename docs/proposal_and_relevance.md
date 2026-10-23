# Project Proposal and Evidence of Relevance

## 1. Project Proposal

**Project Title:** Development of a Browser Extension for Detecting Phishing Indicators with Explainable Results.

### 1.1. Research Question
How does adding rule-based explanations to a locally running browser extension affect undergraduate students' balanced accuracy in classifying phishing and legitimate webpages, compared with the same extension showing risk labels alone?

### 1.2. Project Aim
To develop a lightweight, edge-computing browser extension that detects phishing indicators using deterministic rules, and to evaluate how its rule-linked explanations affect users' balanced webpage-classification accuracy through a controlled $E/L$ (Explanation vs. Label) human-factors study.

### 1.3. System Architecture Vision (Hybrid Edge Engine)
The project represents a comprehensive system relying on **Edge Computing** and **Zero-Data Leakage** principles:
*   **Client-Side Engine:** Built on Chrome Manifest V3, the extension uses on-demand execution (`activeTab`). It locally parses the Document Object Model (DOM) and normalizes URLs using the Public Suffix List (PSL).
*   **XAI (Explainable AI) Module:** Instead of relying on black-box external APIs, the system utilizes a deterministic, rule-based expert engine to translate extracted indicators (e.g., cross-domain form actions, typosquatting) into transparent, human-readable explanations.
*   **Analytics Backend (For Evaluation):** A secure database utilized strictly during the experimental phase to collect anonymized user telemetry (classification decisions, decision time, balanced accuracy) to test the $H_0/H_1$ hypotheses.

### 1.4. Scope and Boundaries
*   **In Scope:** Desktop Chrome execution, user-requested active-tab scanning, DOM/URL metadata extraction, deterministic rule evaluation, and English explanations.
*   **Out of Scope:** Continuous background monitoring (to preserve privacy and memory), automatic page blocking, remote ML inference, and cloud-based Large Language Models (LLMs).

---

## 2. Evidence of Relevance

### 2.1. Global Security Context and the "Black-Box" Problem
According to reports by the **Anti-Phishing Working Group (APWG)** and the **IBM Cost of a Data Breach Report (2023-2024)**, phishing remains the primary initial attack vector globally, with the average cost of a data breach reaching $4.45 million. While industry-standard tools (such as Google Safe Browsing) provide baseline protection, they operate as a "black box," presenting users with binary block screens without explaining the underlying threat vectors.

### 2.2. Alert Fatigue and Human-Computer Interaction (HCI)
The lack of transparency in modern security tools has led to a well-documented psychological phenomenon known as **Alert Fatigue**. When users repeatedly encounter generic warnings without context, they tend to bypass them, especially under time pressure. The core problem is that a risk label alone leaves the user unsure which observation caused the concern, often increasing false suspicion on legitimate sites.

### 2.3. User Needs Validation (Primary Data)
To ground the theoretical problem in user reality, exploratory interviews were conducted with target users (undergraduate students). The findings confirmed that:
1.  Warnings are frequently bypassed when the reasoning is unclear.
2.  Users require actionable help deciding what to do, preferring plain language over technical jargon.
3.  Displaying specific evidence (e.g., "The password form targets an unencrypted HTTP address") helps users make confident, informed decisions.

### 2.4. Research Gap and Expected Contribution
Existing solutions are either heavily reliant on cloud infrastructure (violating privacy) or use resource-heavy local LLMs (introducing high latency and hallucinations). Our project bridges this gap by introducing a lightweight, deterministic XAI framework executed entirely at the edge. By shifting the focus from purely technical detection to human-centric explainability, this applied research will empirically demonstrate whether transparent decision rationale improves user classification accuracy.
