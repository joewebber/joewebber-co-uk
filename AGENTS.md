# AGENTS.md - Repository Context

## Repository Overview

This is the source code for [joewebber.co.uk](https://joewebber.co.uk), a personal website and blog for Joe Webber, a Software Engineer turned Chief Product Officer based in Exeter, UK. The site is built using Hugo, a fast static site generator, and is deployed to GitHub Pages.

## Technology Stack

- **Static Site Generator**: Hugo (built with Go)
- **Markup Language**: Markdown for content
- **Templating**: Go HTML templates
- **Styling**: Custom CSS (`static/index.css`, 266 lines)
- **Deployment**: GitHub Pages via GitHub Actions
- **Domain**: joewebber.co.uk (via CNAME)
- **Content Management**: Decap CMS (formerly Netlify CMS)

## Project Structure

```
/
├── .github/
│   └── workflows/
│       ├── hugo.yml         # Main deployment workflow (official Hugo action)
│       └── gh-pages.yml     # Alternative deployment workflow (peaceiris action)
├── archetypes/
│   └── default.md           # Template for new content files
├── content/
│   ├── about.md             # About page
│   └── posts/
│       └── choosing-your-career-path.md  # Blog post example
├── layouts/
│   ├── _default/
│   │   ├── baseof.html      # Base template
│   │   ├── list.html        # List pages template
│   │   └── single.html      # Single page template
│   ├── partials/
│   │   ├── header.html
│   │   ├── post-header.html
│   │   └── footer.html
│   └── index.html           # Homepage template
├── static/
│   ├── admin/
│   │   ├── index.html       # Decap CMS entry point
│   │   └── config.yml       # Decap CMS configuration
│   ├── images/              # Media uploads directory for CMS
│   ├── CNAME                # Custom domain configuration
│   └── index.css            # Main stylesheet
├── .gitignore
├── .instructions.md         # Hugo CLI reference documentation
├── AGENTS.md               # This file - repository context and integrations
├── CNAME                    # Domain configuration (root)
├── config.toml             # Hugo site configuration
└── README.md               # Getting started guide
```

## Site Configuration

### config.toml Key Settings

- **Base URL**: https://joewebber.co.uk/
- **Language**: en-gb (British English)
- **Title**: "Joe Webber / Tech & Product Leader"
- **Author**: Joe Webber
- **Features**:
  - View transitions enabled
  - Inline CSS enabled
  - RSS feed enabled
  - Unsafe HTML rendering enabled (for flexibility in content)
  - Image caching configured

### Permalinks

- Posts use slug-based URLs: `/posts/:slug/`

### Menu

- Single menu item: "About" linking to `/about`

## Content Management

### Content Types

1. **Pages**: Standard pages like About (`content/about.md`)
2. **Posts**: Blog posts in `content/posts/` directory
   - Example: "Choosing your career path" (dated 2025-04-22)
   - Posts are displayed on the homepage in reverse chronological order

### Front Matter Structure

```yaml
---
title: "Page or Post Title"
date: YYYY-MM-DD
draft: false  # Optional, defaults to false
---
```

### Archetype Template

New content files inherit from `archetypes/default.md`:
- Auto-populated title (derived from filename)
- Auto-populated date
- Draft status set to true by default

### Decap CMS Integration

This site uses [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) for content management. Decap CMS provides a user-friendly web interface for managing content without directly editing markdown files or using Git commands.

#### Authentication
- **Provider**: GitHub OAuth
- **Repository**: `joewebber/joewebber-co-uk`
- **Branch**: `main`
- **Access Control**: Only users with write access to the GitHub repository can use the CMS

#### Configuration
The CMS configuration is located at `static/admin/config.yml` and defines:
- **Backend**: GitHub with repository and branch settings
- **Media Storage**: Images uploaded through the CMS are stored in `static/images/`
- **Collections**:
  - **Posts**: Blog posts in `content/posts/` with fields for title, date, and markdown content
  - **Pages**: Static pages like About page in `content/about.md`

#### Access URL
- **Production**: `https://joewebber.co.uk/admin/`
- **Local Development**: `http://localhost:1313/admin/`

#### How It Works
1. User navigates to the `/admin/` endpoint
2. Decap CMS loads from CDN (`https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js`)
3. User authenticates via GitHub OAuth
4. GitHub verifies the user has write access to the repository
5. User can create/edit content through the visual interface
6. Changes are committed directly to the repository
7. GitHub Actions automatically rebuilds and deploys the site

#### Security
- GitHub OAuth ensures only authorized users can access the CMS
- Repository permissions control who can make changes
- All changes are tracked in Git history
- No credentials or secrets are stored in the codebase

#### Maintenance
- **CMS Version**: 3.x (loaded from CDN with semver range `^3.0.0`)
- **Updates**: The CMS automatically uses the latest 3.x version from unpkg
- **Configuration Changes**: Edit `static/admin/config.yml` to modify collections, fields, or settings

#### CMS Files
- `static/admin/index.html` - Entry point for the CMS interface
- `static/admin/config.yml` - CMS configuration
- `static/images/` - Media upload directory

## Templates and Layout

### Template Hierarchy

1. **baseof.html**: Base template with HTML structure, includes:
   - Meta tags (charset, viewport)
   - Site title
   - CSS link to `/index.css`
   - Main content block
   - Footer partial

2. **index.html**: Homepage template
   - Displays header partial
   - Lists all posts from `posts` section
   - Sorted by date (descending)
   - Shows title, date, and summary for each post

3. **single.html**: Individual page/post template
   - Displays header partial
   - Special post-header partial for posts
   - Standard header for other pages
   - Renders full content

### Partials

- **header.html**: Site header component
- **post-header.html**: Special header for blog posts
- **footer.html**: Site footer component

## Development Workflow

### Local Development

```bash
# Start Hugo development server
hugo server

# Available at http://localhost:1313
# LiveReload enabled for automatic refresh

# Access CMS admin interface at http://localhost:1313/admin/
```

### Creating New Content

#### Via Command Line
```bash
# Create a new blog post
hugo new posts/my-new-post.md

# Remember to set draft: false when ready to publish
```

#### Via Decap CMS
1. Navigate to `http://localhost:1313/admin/` (local) or `https://joewebber.co.uk/admin/` (production)
2. Authenticate with GitHub
3. Click "New Posts" or edit existing content
4. Use the visual editor to write content
5. Click "Publish" to commit changes

### Building for Production

```bash
# Build static site
hugo

# Build with minification
hugo --minify

# Output generated in /public/ directory
```

## Deployment

### GitHub Actions Workflows

Two deployment workflows are configured:

1. **hugo.yml** (Primary - Official Hugo Action)
   - Triggers on push to `main` branch or manual dispatch
   - Uses Hugo v0.128.0 (extended version)
   - Installs Dart Sass for SCSS compilation
   - Builds with minification
   - Deploys to GitHub Pages
   - Uses official GitHub Pages actions

2. **gh-pages.yml** (Alternative - Peaceiris Action)
   - Similar trigger conditions
   - Uses latest Hugo extended version
   - Copies CNAME file to public directory
   - Deploys to `gh-pages` branch
   - Uses peaceiris/actions-hugo and actions-gh-pages

### Domain Configuration

- Custom domain: joewebber.co.uk
- CNAME file ensures domain persistence after deployment
- Files located at:
  - Root: `CNAME`
  - Static: `static/CNAME`

## Styling

### CSS Architecture

- Single CSS file: `static/index.css` (266 lines)
- Inline CSS enabled in configuration
- Linked in base template
- Minimal, custom styling approach (no framework dependencies)

## Key Features

1. **Minimal Dependencies**: No external themes or complex plugins
2. **Custom Templates**: Hand-crafted layouts for full control
3. **RSS Feed**: Auto-generated for posts
4. **View Transitions**: Modern page transition effects enabled
5. **SEO Ready**: Meta tags, semantic HTML
6. **Fast Performance**: Static site generation for optimal speed
7. **Simple Deployment**: Automated via GitHub Actions
8. **User-Friendly CMS**: Decap CMS for non-technical content editing

## Content Guidelines

### Blog Post Best Practices

- Use descriptive titles
- Set appropriate dates
- Remove `draft: true` before publishing
- Keep content in Markdown format
- Summaries auto-generated from content beginning

### About Section

Currently contains:
- Professional introduction
- Location information
- Career progression summary
- Current role focus

## Build and Test

Since this is a Hugo static site with no tests:
- No test suite to run
- Validation done by building the site successfully
- Check locally with `hugo server` before pushing
- GitHub Actions will fail if build errors occur

## Common Tasks

### Adding a New Blog Post

#### Option 1: Command Line
1. Create file: `hugo new posts/post-title.md`
2. Edit content in `content/posts/post-title.md`
3. Set `draft: false` in front matter
4. Commit and push to `main` branch
5. GitHub Actions will automatically deploy

#### Option 2: Decap CMS (Recommended for Non-Technical Users)
1. Navigate to `https://joewebber.co.uk/admin/`
2. Authenticate with GitHub
3. Click "New Posts"
4. Fill in the form with title, date, and content
5. Click "Publish" - changes are automatically committed and deployed

### Updating the About Page

#### Via Command Line
1. Edit `content/about.md`
2. Keep front matter structure
3. Commit and push changes

#### Via Decap CMS
1. Navigate to `https://joewebber.co.uk/admin/`
2. Click on "Pages" → "About"
3. Edit content in the visual editor
4. Click "Publish"

### Modifying Site Configuration

1. Edit `config.toml`
2. Test locally with `hugo server`
3. Commit and push changes

### Styling Changes

1. Edit `static/index.css`
2. Test locally to see changes
3. No build step needed for CSS
4. Commit and push changes

### Managing CMS Configuration

1. Edit `static/admin/config.yml` to modify:
   - Collections (content types)
   - Fields for each content type
   - Media folder location
   - Backend settings
2. Test locally by accessing `/admin/`
3. Commit and push changes

## Dependencies

### Required for Development

- Hugo (v0.128.0 or compatible)
- Git for version control

### Required for Deployment

- GitHub account with Pages enabled
- GitHub Actions enabled
- DNS configured for custom domain (if using)
- Repository write access for CMS users

### Optional Tools

- Text editor with Markdown support
- Hugo syntax highlighting for templates
- Browser with LiveReload support

## Notes for AI Agents

- This is a simple, straightforward Hugo site with minimal complexity
- No package.json or Node.js dependencies
- No theme dependencies - all templates are custom
- Configuration is centralized in config.toml
- Content is purely Markdown files in the content/ directory
- Two deployment workflows exist; hugo.yml appears to be the primary one
- The .instructions.md file contains extensive Hugo documentation for reference
- Always test changes locally before committing if possible
- The site owner focuses on career development and tech leadership content
- **Decap CMS is integrated** for user-friendly content editing via web interface
  - Access at `/admin/` endpoint
  - Uses GitHub OAuth for authentication
  - Only repository collaborators with write access can use the CMS
  - Changes made through CMS are committed directly to the repository
