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

### Authentication & Access Control

The CMS uses GitHub OAuth for authentication. **Only users with write access to the `joewebber/joewebber-co-uk` repository can access and use the CMS.** This is controlled at the GitHub repository level through:
- Repository collaborators with write permissions
- Organization team members with write access
- Repository owners

To ensure only you can access the admin screen, make sure no other users have write access to your GitHub repository. You can verify this in your repository settings under "Collaborators and teams" or "Manage access".

### CMS Features

- Edit posts and pages through a user-friendly interface
- Add new blog posts without touching code
- Upload and manage images
- Preview content before publishing

## Deployment

Upload the contents of the `public/` folder to your web server or use a static hosting service (Netlify, Vercel, GitHub Pages, etc).

## License

MIT License
