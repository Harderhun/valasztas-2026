# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev server

```bash
npx serve -p 3737 .
```

The `.claude/launch.json` configures this as the default run configuration.

## Architecture

Single-page vanilla JS webapp, no build step, no dependencies beyond Google Fonts CDN.

**3 active files:**
- `index.html` — full page markup, 7 sections, sidebar nav
- `styles.css` — all styles (~1600 lines), CSS custom properties for tokens
- `script.js` — all JS (~420 lines), plain IIFEs + two `window.*` globals

`parlament_tisza_elemzes.html` is the original single-file prototype — kept for reference, not served.

## Design tokens (CSS variables)

```css
--bg: #F5F2EC      /* parchment background */
--card: #FDFBF7    /* card surface */
--ink: #1A1915     /* primary text */
--accent: #C8440A  /* orange-red accent */
--tisza: #2A6DB5   /* Tisza blue */
--fidesz: #C03030  /* Fidesz red */
--mihaz: #C07020   /* Mi Hazánk orange */
--sidebar-w: 260px
```

## Layout

Fixed 260px sidebar (desktop) + `main` max-width 1200px. Responsive breakpoint at 900px — sidebar collapses to slide-in with hamburger + overlay.

## Sections

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

## Font sizes

Content text: 15px. Interactive controls (buttons, tabs): 14px. Secondary labels: 13px. Badges/chips/micro-labels (all-caps, bar text, tick marks): 11–12px. Minimum readable size for the target audience (older readers) is 14px for body copy.
