# Agents Documentation

This document provides information about agents and integrations used in this project.

## Decap CMS Integration

### Overview
This site uses [Decap CMS](https://decapcms.org/) (formerly Netlify CMS) for content management. Decap CMS provides a user-friendly web interface for managing content without directly editing markdown files or using Git commands.

### Authentication
- **Provider**: GitHub OAuth
- **Repository**: `joewebber/joewebber-co-uk`
- **Branch**: `main`
- **Access Control**: Only users with write access to the GitHub repository can use the CMS

### Configuration
The CMS configuration is located at `static/admin/config.yml` and defines:
- **Backend**: GitHub with repository and branch settings
- **Media Storage**: Images uploaded through the CMS are stored in `static/images/`
- **Collections**:
  - **Posts**: Blog posts in `content/posts/` with fields for title, date, and markdown content
  - **Pages**: Static pages like About page in `content/about.md`

### Access URL
- **Production**: `https://joewebber.co.uk/admin/`
- **Local Development**: `http://localhost:1313/admin/`

### How It Works
1. User navigates to the `/admin/` endpoint
2. Decap CMS loads from CDN (`https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js`)
3. User authenticates via GitHub OAuth
4. GitHub verifies the user has write access to the repository
5. User can create/edit content through the visual interface
6. Changes are committed directly to the repository
7. GitHub Actions automatically rebuilds and deploys the site

### Security
- GitHub OAuth ensures only authorized users can access the CMS
- Repository permissions control who can make changes
- All changes are tracked in Git history
- No credentials or secrets are stored in the codebase

### Maintenance
- **CMS Version**: 3.x (loaded from CDN with semver range `^3.0.0`)
- **Updates**: The CMS automatically uses the latest 3.x version from unpkg
- **Configuration Changes**: Edit `static/admin/config.yml` to modify collections, fields, or settings

### Files
- `static/admin/index.html` - Entry point for the CMS interface
- `static/admin/config.yml` - CMS configuration
- `static/images/` - Media upload directory
