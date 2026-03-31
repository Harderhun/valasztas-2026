# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev server

```bash
npx serve -p 3737 .
```

The `.claude/launch.json` configures this as the default run configuration.

## Deployment

GitHub Pages at `harderhun.github.io/valasztas-2026/`. OG image: `valasztas-2026.png`.

## Architecture

Single-page vanilla JS webapp, no build step, no dependencies beyond Google Fonts CDN.

**Active files:**
- `index.html` — full page markup, 8 sections (0–7), sidebar nav
- `styles.css` — all styles (~1600 lines), CSS custom properties for tokens
- `script.js` — all JS (~560 lines), plain IIFEs + two `window.*` globals (`toggleTier`, `showSc`)
- `forrasadatok.html` — standalone sources/references page (self-contained, own styles)

## Data layer

Poll data lives in `script.js` as two top-level constants that need periodic updates:
- `PARTIES` array — party name, leader, color, poll %, threshold status (`in`/`edge`/`out`)
- `POLLS` array — per-institute poll results with date and type (`independent`/`gov`)
- `POLL_DATE` string — display date for the aggregate

Section 0 (party cards, aggregate bar, poll comparison table) is entirely JS-generated from these arrays.

The Gantt chart data (Section 4) is also a JS array in `script.js` — institutional mandate periods with start/end years and types.

## Design tokens (CSS variables)

```css
/* Core palette */
--bg: #F5F2EC          /* parchment background */
--card: #FDFBF7        /* card surface */
--ink: #1A1915         /* primary text */
--ink2: #5C5A54        /* secondary text */
--accent: #C8440A      /* orange-red accent */

/* Party colors (each has a -l lighter variant) */
--tisza: #2A6DB5       /* Tisza blue */
--fidesz: #C03030      /* Fidesz red */
--mihaz: #C07020       /* Mi Hazánk orange */

/* Layout */
--sidebar-w: 260px
--topbar-h: 52px
--r: 12px              /* border radius */
```

## Typography

Fraunces (serif) for headings, DM Sans (sans-serif) for body. Loaded from Google Fonts CDN.

Content text: 15px. Interactive controls: 14px. Secondary labels: 13px. Badges/chips: 11–12px. Minimum readable size for the target audience (older readers) is 14px for body copy.

## Layout

Fixed 260px sidebar (desktop) + `main` max-width 1200px. Responsive breakpoint at 900px — sidebar collapses to slide-in with hamburger + overlay.

## Sections

0. **Pártok és közvélemény** — JS-generated party cards + aggregate bar + poll comparison table (from `PARTIES`/`POLLS` data)
1. **Szavazati küszöbök** — tier cards (accordion via `toggleTier(id)`), seats bar viz, filter tabs
2. **Tisza-forgatókönyvek** — A/B/C/D tabs via `showSc(n)`
3. **Sarkalatos törvények** — searchable/filterable table (`#sarkalatos-search`, `.cat-btn`)
4. **Intézményi időbomba** — Gantt chart, JS-generated into `#gantt-rows` / `#gantt-axis`; range 2014–2036, highlight 2026–2030
5. **Forgatókönyv-mátrix** — static comparison table A/B/C/D × 15 hatáskör
6. **Bizalmatlansági indítvány** — 5-step flowchart
7. **EU/Nemzetközi korlátok** — 8-card grid

## Adding a new section

1. Add `<section id="section-N">` in `index.html`
2. Add `<a href="#section-N" class="nav-item" data-section="section-N">` to the sidebar `<nav>`
3. Add component styles in `styles.css`
4. IntersectionObserver in `script.js` auto-picks up new sections for active nav highlight and scroll reveal (use `data-reveal` attribute on elements)
