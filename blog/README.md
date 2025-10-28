# Blog (NueJS)

This folder contains the source code and content for the blog section of the site, built using [NueJS](https://nuejs.org/).

## Structure

- `index.html` — Main entry point for the blog.
- `layout.html` — Shared layout template for blog pages.
- `index.css` — Global styles for the blog.
- `site.yaml` — Site configuration and metadata.
- `posts/` — Blog posts, written in Markdown (`.md`) or HTML. Each post is a separate file.
  - Example post: `developers-guide-to-career-options.md`
  - Example layout/component: `components.html` (not a post, but a layout file for post components)

## Getting Started

1. **Install Bun** (if not already installed):

Linux & macOS:

```sh
curl -fsSL https://bun.sh/install | bash
```

Windows:

```sh
powershell -c "irm bun.sh/install.ps1 | iex"
```

2. **Install Nue CLI** (if not already installed):

```sh
bun install --global nuekit
```

3. **Run the development server:**

```sh
nue
```

4. **Build for production:**

```sh
nue build blog
```

## Adding Posts

- Add new Markdown or HTML files to the `posts/` directory.
- Update `site.yaml` if you want to add metadata or navigation links.

## Customisation

- Edit `layout.html` to change the shared layout for all blog pages.
- Edit `index.css` for global styles.

## Learn More

- [NueJS Documentation](https://nuejs.org/docs)
