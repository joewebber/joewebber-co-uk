# Joe Webber - Hugo Static Site

This is the source code for [joewebber.co.uk](https://joewebber.co.uk), built with the [Hugo](https://gohugo.io/) static site generator.

## Getting Started

1. **Install Hugo**
   - On Ubuntu: `sudo apt-get install hugo`
   - Or see [Hugo install docs](https://gohugo.io/getting-started/installing/)

2. **Run the site locally**
   ```sh
   hugo server
   ```
   The site will be available at `http://localhost:1313`.

3. **Build for production**
   ```sh
   hugo
   ```
   The static files will be generated in the `public/` directory.

## Project Structure

- `content/` — Markdown posts and pages
- `layouts/` — HTML templates (Go templates)
- `static/` — CSS, images, and other static assets
- `config.toml` — Site configuration
- `scripts/` — Utility scripts (e.g., LinkedIn post importer)

## Deployment

Upload the contents of the `public/` folder to your web server or use a static hosting service (Netlify, Vercel, GitHub Pages, etc).

## Importing LinkedIn Posts

You can import LinkedIn posts as articles using the CSV import script. See [`scripts/README.md`](scripts/README.md) for detailed instructions.

Quick start:
```sh
python3 scripts/import_linkedin_posts.py linkedin_posts.csv
```

## License

MIT License
