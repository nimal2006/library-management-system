# EduLibrary — Frontend-only Library Management Demo

This is a simple, modern, animated Library Management System built using only HTML, CSS and JavaScript (no backend). It's designed for college submission and easy viva demonstration.

## Files

- `index.html` — Animated login page (credentials: `admin` / `1234`).
- `dashboard.html` — Dashboard with animated statistics and theme toggle.
- `books.html` — Book management (issue / return / add book) with modal.
- `style.css` — UI styles: glassmorphism, gradients, animations.
- `script.js` — All application logic, localStorage persistence and UI updates.

## How it stores data

- Uses `localStorage` under key `elib_books` to save a JSON array of books.
- Theme is stored in `elib_theme`. Login state is saved in `elib_user`.
- On first run the app seeds sample books automatically.

## How to run

1.  Open `web-project/index.html` in a browser (double-click is fine).
2.  Or serve the folder with a simple static server, for example:

```powershell
# From the repository root
# Python 3
python -m http.server 8000
# then open http://localhost:8000/web-project/index.html
```

## Quick demo script (for viva)

1.  Open `index.html`. Show the animated login card.
2.  Enter `admin` / `1234`. Click Login (button animation plays).
3.  On `dashboard.html` show the animated counters (Total / Issued / Available).
4.  Toggle Dark / Light mode using the top-right icon — explain `data-theme` and CSS variables.
5.  Click Manage Books → `books.html`. Show the table and Issue / Return buttons.
6.  Issue a book (prompt for member id) — explain how `localStorage` is updated and counters change.
7.  Add a new book with Add Book modal and show it persists across reload.

## Viva talking points (short)

- Architecture: Single-page HTML files + shared `script.js`; uses `localStorage` as persistence to avoid backend complexity for demo.
- UI: Glassmorphism cards, gradient accents, CSS animations (fade-in, floaty, hover effects) and accessibility basics (focusable inputs, aria-hidden modal).
- JS: Simple, modular helper functions (load/save), clear separation of concerns (auth, theme, books), no frameworks so it's easy to explain line-by-line.
- Limitations: No real authentication or server persistence — explain that replacing `localStorage` with an API would be straightforward.

## Next suggested additions (optional)

- CSV export/import for books (helpful to prepare test data).
- Simple printable report (HTML → print) for submission.
- Small README screenshots or short screencast for faster grading.

If you want, I can add CSV import/export or prepare a short set of screenshots and a one-page viva script.
