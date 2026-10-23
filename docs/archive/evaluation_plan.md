# Verification and Evaluation Plan

## 1. Evaluation Objectives
Verify detection accuracy, explainability clarity, and performance impact (latency & RAM) of the proposed extension on standardized phishing and legitimate datasets.

---

## 2. Target Metrics

| Metric | Target Value | Verification Method |
|---|---|---|
| **Detection Accuracy** | > 93% | Evaluated against verified test dataset split |
| **False Positive Rate (FPR)** | < 3% | Tested on Top 1,000 legitimate domains (Tranco list) |
| **Precision & Recall** | Precision > 92%, Recall > 90% | F1-score calculation on benchmark sets |
| **Execution Latency** | < 200 ms | In-browser Performance API measuring time from DOM ready to score output |
| **Memory Footprint** | < 50 MB | Chrome Task Manager resource monitoring |

---

## 3. Benchmark Datasets and Test Conditions
- **Phishing Samples:** 5,000 active and verified phishing URLs sourced from **PhishTank** and **OpenPhish**.
- **Benign Samples:** 5,000 legitimate domains sampled from the **Tranco Top 1M** and university domains.
- **Test Environment:** 
  - Google Chrome (latest stable release) running on standard desktop hardware (Intel Core i5 / 16 GB RAM).
  - Network emulation: standard broadband connection (100 Mbps) with clean browser cache.

---

## 4. Baseline Solution for Comparison
- **Baseline 1:** Google Safe Browsing Lookup API (Standard blacklist/hash matching).
- **Baseline 2:** Rule-based heuristic baseline (standard URL-only feature extractor without explainable DOM inspection).
- **Hypothesis:** Our solution will show comparable accuracy to blacklists on known threats, significantly higher detection of zero-day/unlisted attacks, and superior explainability compared to generic red warning screens.