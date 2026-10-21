# Supervisor Feedback and Iterations

- **Supervisor:** Aitynbek Seitenov

## Review Checkpoints & Actions

### Checkpoint 1 (Draft Review)
- **Feedback received:** 
  1. Emphasize the distinct engineering value of the Explainability (XAI) component rather than presenting another basic URL blacklist checker.
  2. Ensure strict compliance with Chrome Manifest V3 regulations from the beginning to prevent architecture refactoring later.
  3. Clearly separate URL lexical checks from DOM content checks in the architectural diagrams.
- **Implemented Actions:**
  1. Updated the requirements and proposal to prioritize user-readable indicator explanations (FR-03, NFR-05).
  2. Configured the project skeleton strictly around Manifest V3 Service Worker guidelines.
  3. Decomposed the component architecture into distinct `Content Script (DOM)` and `Background Service Worker (URL & Heuristics)` modules.