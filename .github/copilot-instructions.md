# Copilot Instructions for `netlify-sent-cv-to.me`

## Project shape and purpose
- This is a **single-page static web app** for CV upload, built with plain HTML/CSS/JavaScript (no framework, no bundler).
- Main files:
  - `intex.html`: page structure and element IDs used by JS.
  - `style.css`: all styling and theme variables.
  - `script.js`: form validation, submission, and UI state transitions.
- UI copy is primarily Azerbaijani; keep user-facing text consistent with existing language unless explicitly asked otherwise.

## Runtime and workflow
- No build step and no test suite are present.
- Run locally with any static server from repo root, for example:
  - `python3 -m http.server 8080`
  - open `http://localhost:8080/intex.html`
- Because this uses browser APIs (`fetch`, `FormData`, file input), prefer real browser verification over file:// usage.

## Architecture and data flow
- Submission flow in `script.js`:
  1. Read `email` and selected file from form controls.
  2. Validate email format via regex.
  3. Validate file exists and is PDF/DOCX (MIME and extension checks).
  4. Build `FormData` with keys `cv` and `email`.
  5. POST to webhook URL (`webhookUrl` constant).
  6. Update UI state (`showMessage`, submit button disable/loading text, form reset).
- Integration boundary: external n8n webhook endpoint in `script.js`. Treat this as environment-specific and avoid accidental changes.

## Code conventions in this repo
- DOM access is ID-driven; JS assumes IDs in `intex.html` remain stable (`cvForm`, `cvFile`, `email`, `fileName`, `dropText`, `statusMessage`, `submitBtn`).
- Status rendering pattern: use `showMessage(msg, type)` and CSS classes `.message.error` / `.message.success`.
- Keep validation order and early-return style as implemented in form submit handler.
- Maintain current UX state handling:
  - hide status before submit attempt,
  - disable button while request is in-flight,
  - restore button text/state in `finally`.

## Styling patterns
- Reuse CSS custom properties from `:root` instead of introducing arbitrary new color values.
- Keep layout centered card-based design and existing class names (`.card`, `.form-group`, `.file-drop-area`, `.message`).

## Agent editing guidance
- Make minimal, surgical changes; avoid introducing frameworks or build tooling.
- If adding form fields, update both `intex.html` IDs/names and `script.js` `FormData` population consistently.
- If changing API behavior, document expected payload keys and response handling in this file or `README.md`.
- Note: entry file is named `intex.html` (not `index.html`); preserve unless a deliberate rename is requested.
