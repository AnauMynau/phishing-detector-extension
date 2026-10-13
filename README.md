# phishing-detector-extension

# Project Proposal: Phishing Indicator Detector with Explainable Results

- **Project Title:** Development of a Browser Extension for Detecting Phishing Indicators with Explainable Results
- **Team Members:** Inayatulla Noyan & Nurtilek Koblandy 
- **Supervisor:** Aitynbek Seitenov

## Problem Statement
Phishing attacks continue to evolve rapidly, employing sophisticated tactics such as typosquatting, IDN homograph attacks, and dynamic malicious DOM forms. Current browser-based security mechanisms largely operate as black boxes, providing vague alerts or blocking pages without clear explanations. Consequently, users experience alert fatigue, lack contextual understanding, and frequently bypass critical security warnings.

## Target Audience
Everyday internet users and enterprise employees susceptible to social engineering, as well as security practitioners requiring rapid, explainable verification of suspicious web resources.

## Aim & Objectives
The primary aim is to develop a lightweight Chromium browser extension capable of detecting phishing indicators in real-time and presenting interpretable, explainable evidence to empower informed user decisions.

**Key Objectives:**
1. Investigate and identify robust URL, DOM, and network indicators indicative of phishing vectors.
2. Design and evaluate a lightweight classification pipeline (heuristic-driven or machine learning model) to calculate threat risk scores.
3. Integrate an Explainable AI (XAI) module to generate intuitive, user-friendly rationales detailing specific risk factors.
4. Implement a responsive client-side browser extension utilizing Manifest V3 with minimal latency overhead.
5. Empirically evaluate detection accuracy, inference speed, and explainability clarity using benchmark phishing datasets.

## Scope & Engineering Complexity
- **In Scope:** URL entropy and structural lexical analysis, DOM inspection (password inputs, iframe cloaking, external form actions), client-side/hybrid inference, and interactive UI explanation panels.
- **Out of Scope:** Deep binary payload analysis of downloadable files and host-level traffic interception outside browser scope.
- **Engineering Complexity:** Navigating Manifest V3 service-worker constraints, optimizing real-time DOM parsing latency (<250 ms), and translating complex classification weights into transparent, non-technical explanations.
