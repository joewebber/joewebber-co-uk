# Joe Webber - Personal Site

This is the source code for [joewebber.co.uk](https://joewebber.co.uk) — a plain static site (no framework) built with [Vite](https://vitejs.dev/).

It's a single scrolling one-page site. All copy lives directly in `index.html`.

## Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```

2. **Run the site locally**
   ```sh
   npm run dev
   ```
   The site will be available at `http://localhost:5173`.

3. **Build for production**
   ```sh
   npm run build
   ```
   The static files will be generated in the `dist/` directory.

4. **Preview the production build**
   ```sh
   npm run preview
   ```

## Project Structure

- `index.html` — the entire page (all sections, hardcoded content)
- `src/style.css` — stylesheet
- `src/main.js` — vanilla JS behaviour (clock, scroll-spy nav, drag interaction)
- `src/pixel-field.js`, `src/pixel-drift.js`, `src/pixel-trail.js` — self-contained Web Components for the animated background (noise-grid field, drifting pixel-art icons, cursor trail)
- `public/` — files copied as-is into the build output (e.g. `CNAME`)

## Editing content

There's no CMS or templating layer — edit the relevant section directly in `index.html`.

## Deployment

Deployed via [Netlify](https://netlify.com), building from the `main` branch with `npm run build`. See `netlify.toml`.

## License

MIT License
