# CLAUDE.md - Repository Context

## Overview

Personal website for Joe Webber ([joewebber.co.uk](https://joewebber.co.uk)), a Software Engineer turned Chief Product Officer based in Exeter, UK. Built with Hugo and deployed via Netlify.

## Technology Stack

- **Static Site Generator**: Hugo v0.160.1
- **Config file**: `hugo.toml`
- **Markup**: Markdown
- **Templating**: Go HTML templates
- **Styling**: Custom CSS (`assets/index.css`) — processed via Hugo Pipes with fingerprinting
- **Deployment**: Netlify (config in `netlify.toml`)
- **Content Management**: Decap CMS (`static/admin/`)
- **Domain**: joewebber.co.uk

## Project Structure

```
/
├── archetypes/
│   ├── default.md           # Default archetype for new content
│   └── projects.md          # Archetype for new projects (includes type + status)
├── assets/
│   └── index.css            # Main stylesheet (Hugo Pipes + fingerprint)
├── content/
│   ├── _index.md            # Homepage content
│   ├── articles/            # Long-form articles
│   ├── posts/               # Short posts (shown in full on list page)
│   └── projects/            # Projects (type + status fields, no date)
│       └── _index.md
├── layouts/
│   ├── _default/
│   │   ├── baseof.html      # Base template
│   │   ├── list.html        # List pages (handles posts/articles/projects differently)
│   │   └── single.html      # Single page
│   ├── partials/
│   │   ├── header.html      # Site header + nav (Projects, Posts, Articles)
│   │   ├── post-header.html # Header for posts and articles (shows date)
│   │   ├── project-header.html # Header for projects (shows type + status badges)
│   │   └── footer.html      # Footer with social links
│   └── index.html           # Homepage template
├── static/
│   ├── admin/
│   │   ├── index.html       # Decap CMS entry point
│   │   └── config.yml       # Decap CMS configuration
│   ├── images/              # Media uploads
│   └── CNAME
├── hugo.toml                # Hugo site configuration
├── netlify.toml             # Netlify build + deployment config
└── CNAME
```

## Site Configuration (`hugo.toml`)

- **Base URL**: https://joewebber.co.uk/
- **Language**: `en-gb`
- **Copyright**: Joe Webber
- **Permalinks**: `/posts/:slug/`, `/projects/:slug/`
- **Pagination**: 5 items per page (`pagination.pagerSize`)
- **RSS**: enabled for homepage
- **View transitions**: enabled (`params.viewTransitions`)
- **Unsafe HTML in Markdown**: enabled (`markup.goldmark.renderer.unsafe`)

## Content Types

### Posts (`content/posts/`)
Short social-media-style writing. Shown in **full** on the list page. Requires `date`.

### Articles (`content/articles/`)
Long-form writing. Shown as **summary** on the list page. Requires `date`.

### Projects (`content/projects/`)
Project showcase. No date. Uses `type` and `status` fields instead.

```yaml
---
title: "Project Name"
type: "tool"        # Shown as a teal badge — e.g. tool, website, open-source
status: "Active"    # Shown as an orange badge — e.g. Active, Archived, In Progress
tech:               # Shown as neutral badges on list + single pages
  - Hugo
  - Go
link: "https://github.com/..."  # Optional — shown as "View Project →" on single page
draft: false
---
```

- `type` is Hugo's built-in content type field, accessed in templates via `.Type`
- `status` is a custom param, accessed via `.Params.status`
- `tech` is a list param, accessed via `range .Params.tech`
- `link` is optional — only rendered if present
- Badges only render when values are set

### Standard front matter (posts + articles)

```yaml
---
title: "Title"
date: YYYY-MM-DD
draft: false
---
```

## Templates

- **list.html**: Posts show full content; Articles show summary + date; Projects show summary + type/status badges (no date)
- **single.html**: Routes to `post-header.html` for posts/articles, `project-header.html` for projects
- **post-header.html**: Shows date then title
- **project-header.html**: Shows type + status badges then title

## Styling

- Single file: `assets/index.css`
- Uses CSS `@layer base, components`
- CSS variables: `--color-primary` (teal `71 160 180`), `--color-secondary` (orange `228 156 95`)
- `.project-type` badge: teal pill; `.project-status` badge: orange pill
- Google Fonts: Inter Tight, PT Serif, Quicksand
- Responsive: mobile-first, 768px breakpoint

## Decap CMS

- Access: `https://joewebber.co.uk/admin/`
- Auth: GitHub OAuth (requires repo write access)
- Collections: **Projects** (type, status), **Posts** (date), **Articles** (date), **Pages** (homepage)
- Config: `static/admin/config.yml`

## Deployment

Netlify builds from `main` branch automatically on push:
- Build command: `hugo --minify`
- Publish dir: `public`
- Hugo version: `0.160.1`
- Deploy previews and branch deploys are configured

## Development

```bash
hugo server        # Start dev server at http://localhost:1313
hugo new projects/my-project.md   # New project (uses archetypes/projects.md)
hugo new posts/my-post.md         # New post
hugo new articles/my-article.md   # New article
hugo --minify      # Production build → /public
```

Requires Hugo v0.160.1. On WSL/Linux, install the binary directly from the GitHub releases page — the `apt` package is typically outdated.

## Notes for AI Agents

- No Node.js, no theme dependencies — all templates are fully custom
- Config is in `hugo.toml` (not `config.toml`)
- CSS is in `assets/index.css` (Hugo Pipes), not `static/`
- No test suite — validate by running `hugo` and checking for build errors
- The `author` top-level config key has been removed (deprecated in Hugo v0.127)
- Projects use Hugo's built-in `type` field (`.Type`) — not `.Params.type`
- When adding new content sections, update: `list.html`, `single.html`, a new partial, `header.html`, `config.yml` (CMS), and `hugo.toml` (permalink)
