# CLAUDE.md - Repository Context

## Overview

Personal website for Joe Webber ([joewebber.co.uk](https://joewebber.co.uk)), a Software Engineer turned Chief Product Officer based in Exeter, UK. A plain static site (no framework, no SSG) built and served with Vite, deployed via Netlify.

The site is a single scrolling one-page design (dark theme) with five sections: Intro, Playground (personal projects), Professional, Talks / Media, and Contact. All copy is hardcoded directly in `index.html` — there is no content collection or CMS.

## Technology Stack

- **Build tool**: Vite (dev server + production bundling/minification/hashing)
- **Markup**: Plain HTML — `index.html` at the repo root
- **Styling**: Plain CSS (`src/style.css`)
- **JS**: Vanilla JS, no dependencies (`src/main.js`), loaded as an ES module
- **Deployment**: Netlify (config in `netlify.toml`)
- **Domain**: joewebber.co.uk

## Project Structure

```
/
├── index.html          # The entire page — all sections, hardcoded content
├── src/
│   ├── style.css        # Entire stylesheet
│   ├── main.js          # Clock, scroll-spy nav, drag interaction
│   ├── pixel-field.js    # <pixel-field> custom element — dissolving noise-grid background
│   ├── pixel-drift.js    # <pixel-drift> custom element — drifting pixel-art icons
│   └── pixel-trail.js    # <pixel-trail> custom element — cursor pixel trail
├── public/               # Passed through to the build output as-is
│   ├── CNAME
│   ├── icons/            # Pixel-art SVGs used as mask-images by <pixel-drift>
│   └── images/
├── package.json
├── netlify.toml          # Netlify build + deployment config
└── CNAME
```

There is no `content/` directory, no templating engine, and no CMS — the previous multi-page Hugo site (and before that, a one-page Hugo redesign) was replaced with this plain static page. To change copy, edit `index.html` directly.

## Page Sections (`index.html`)

All five sections live in one file, identified by `id` (used for anchor links/scroll) and `data-sec` (used by the scroll-spy JS to highlight the active nav rail item):

| # | id             | Content |
|---|----------------|---------|
| 00 | `#intro`        | Hero heading, two intro paragraphs, a 4-column stat grid |
| 01 | `#playground`   | Draggable project card collage (real project: Slingpin) plus two "reserved" placeholder slots and a decorative "poke me" circle |
| 02 | `#professional`  | Career copy (3-column prose grid) and a pull-quote |
| 03 | `#talks`        | Table of talks/media rows — currently all placeholder ("TBC") entries |
| 04 | `#contact`      | LinkedIn and GitHub links |

The fixed left-hand nav rail and fixed header (name, role, live UK clock) are outside `<main>` in the same file.

## Styling (`src/style.css`)

- Uses CSS `@layer base, layout, components`
- Dark theme: `--bg: #0a0c11`, `--fg: #eceef3`, accent `--accent: oklch(0.78 0.19 95)` (amber/gold)
- Fonts: Archivo (body), Bebas Neue (display/headings), Martian Mono (labels/mono UI text) — loaded via Google Fonts `@import`
- Responsive breakpoint at 900px (nav rail hides) and smaller breakpoints for stat grid / talks rows
- **Cascade layer gotcha**: because layers are declared `base, layout, components` (in that order), a rule in a later-declared layer always wins over an earlier one for the same property/selector, regardless of media-query specificity. Responsive overrides for anything defined in the `components` layer (e.g. `.site-nav`) must themselves live in `components`, placed after the base rule — see the "responsive overrides" block at the end of that layer in `src/style.css`.

## Behaviour (`src/main.js`)

Vanilla JS, no dependencies, split into small init functions run on `DOMContentLoaded`:

- `initClock` — live UK time in the header, updated every 20s
- `initYear` — fills in the footer's copyright year at runtime
- `initScrollSpy` — highlights the active nav rail link and fills the rail progress line based on scroll position
- `initDrag` — pointer-event drag interaction for the Playground cards (`#collage [data-drag]`)

`main.js` also imports `pixel-field.js`, `pixel-drift.js` and `pixel-trail.js` for their side effect of registering three custom elements, used in `index.html` as `<pixel-field>`, `<pixel-drift>`, `<pixel-trail>`:

- **`<pixel-field>`** — a canvas driven by animated 3D value noise, rendered as a dissolving grid of cells. Density is weighted by position (dense toward the edges, clear where the copy sits) and each cell is tinted along a slowly-rotating amber→navy diagonal ramp. Attributes: `cell`, `accent`, `base`, `density`.
- **`<pixel-drift>`** — real pixel-art SVG icons (`public/icons/*.svg`, the Streamline Pixel set) applied as CSS `mask-image` on tinted divs, drifting with a sinusoidal float plus mouse-parallax and scroll-parallax, tinted with the same rotating colour ramp as the field. Attributes: `count`, `scale`, `accent`, `base`.
- **`<pixel-trail>`** — a canvas that emits grid-snapped pixel "bits" from the cursor on `pointermove`, with simple gravity/decay physics, warm (accent) or cool (`#eceef3`) coloured. Attributes: `cell`, `accent`, `rate`.

These three are self-contained Web Components (no dependency on each other or on any external runtime) ported directly from the original Claude Design export rather than reimplemented from scratch — keep them in sync with that source if the design is revisited.

## Deployment

Netlify builds from `main` branch automatically on push:
- Build command: `npm run build`
- Publish dir: `dist`
- Node version: 24

## Development

```bash
npm install
npm run dev       # Start Vite dev server (default http://localhost:5173)
npm run build      # Production build → /dist
npm run preview    # Serve the production build locally
```

## Notes for AI Agents

- No SSG, no theme dependencies, no content collections — the whole site is `index.html` + `src/style.css` + `src/main.js`
- No test suite — validate by running `npm run build` and checking for errors, then visually check `npm run dev` output
- To change copy (project cards, talks rows, professional bio, etc.), edit the relevant section directly in `index.html` — there is intentionally no templating/CMS layer
- `public/` files are copied to the build output unchanged (used here for `CNAME`) — don't put anything there that needs processing
