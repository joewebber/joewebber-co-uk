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

## Content Management

This site uses [Decap CMS](https://decapcms.org/) for content management. 

### Accessing the CMS

1. Navigate to `https://joewebber.co.uk/admin/` (or `http://localhost:1313/admin/` when running locally)
2. Authenticate with your GitHub account
3. Start creating and editing content

### CMS Features

- Edit posts and pages through a user-friendly interface
- Add new blog posts without touching code
- Upload and manage images
- Preview content before publishing

**Note:** You need write access to the GitHub repository to use the CMS.

## Deployment

Upload the contents of the `public/` folder to your web server or use a static hosting service (Netlify, Vercel, GitHub Pages, etc).

## License

MIT License
