---
applyTo: "**"
---

The following document provides a comprehensive overview of the Nue web development framework, including code examples for each of its core components.
This project uses Nue to build a minimalist blog site. The README and .gitignore files have been set up to guide users on how to develop and build the blog using Nue.

# Nue: The UNIX of the Web

Nue is a minimalist web development ecosystem that brings the UNIX philosophy to modern web development. It replaces hundreds of megabytes of dependencies with a complete 1MB toolkit focused on simplicity, standards, and separation of concerns. Unlike React-based frameworks that mix JavaScript with HTML and CSS in component files, Nue enforces pure separation: business logic lives in JavaScript modules, structure in HTML, and design in CSS. This architectural clarity eliminates the complexity that has plagued modern web development.

The framework provides a complete development experience including Nuekit (CLI and build system), Nuedom (HTML-first UI assembly), Nuemark (content-first markdown), Nueserver (edge-first HTTP server), Nuestate (URL-first state management), Nueglow (CSS-first syntax highlighting), and Nueyaml (predictable YAML parser). Each component follows a standards-first approach, leveraging native browser APIs like `<dialog>`, `<details>`, form validation, and Web Components. This results in 10x smaller pages, millisecond builds, and universal hot reload across content, CSS, layouts, data, components, and server routes.

## Nuekit CLI: Project Development and Build System

The Nuekit CLI provides unified commands for serving, building, and managing Nue projects with instant startup and zero configuration.

```bash
# Start development server with hot reload
nue serve
nue  # serve is the default command

# Build production site
nue build

# Preview production build locally
nue preview --port 8080

# Build specific file types only
nue build .md .css

# Build with verbose output and clean dist
nue build --verbose --clean

# Dry run to see what would be built
nue build --dry-run

# Create new project from template
nue create my-blog
nue create my-app ./projects/myapp
```

## Nuedom: HTML-First UI Assembly with Reactive Components

Nuedom compiles HTML templates into reactive components without virtual DOM overhead, mapping directly to DOM operations.

```javascript
import { parseNue, compileNue, renderNue, createDocument } from "nuedom";

// Browser usage: parse and compile template
const template = `
  <form :onsubmit="submit">
    <input type="email" name="email" required>
    <textarea name="message" minlength="10" required></textarea>
    <button>Send</button>

    <script>
      async submit(e) {
        e.preventDefault()
        const res = await fetch('/api/contact', {
          body: new FormData(e.target),
          method: 'POST'
        })
        if (res.ok) success.showPopover()
      }
    </script>
  </form>

  <dialog id="success" popover>
    <h2>Message sent!</h2>
    <button popovertarget="success">Close</button>
  </dialog>
`;

// Parse template to AST
const doc = parseNue(template);
console.log(doc.root); // AST structure
console.log(doc.lib); // Component definitions
console.log(doc.script); // Inline scripts

// Compile to JavaScript module
const compiled = compileNue(doc);
// Generates: export const lib = {...component definitions...}

// Server-side rendering
const fakedom = createDocument();
const html = renderNue(template, { email: "test@example.com" }, fakedom);
console.log(html); // Returns rendered HTML string
```

## Nuemark: Content-First Markdown with Rich Document Structures

Nuemark extends standard Markdown with purpose-built syntax for modern web content while keeping it accessible to non-technical authors.

```javascript
import { nuemark, parseNuemark, elem, renderInline } from "nuemark";

// Basic rendering: converts enhanced markdown to HTML
const content = `
# Welcome to Nuemark

This is a paragraph with **bold** and *italic* text.

[image src="hero.jpg" width="800" size="large"]
  A responsive image with automatic optimization

## Features

- Standard Markdown compatibility
- Custom tags and components
- Automatic sections and grids
- Syntax highlighting with Nueglow

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

[video src="demo.mp4" autoplay loop]

[table]
  | Feature | Status |
  |---------|--------|
  | Fast    | ✓      |
  | Simple  | ✓      |
`;

const html = nuemark(content, {
  components: {
    /* custom component renderers */
  },
  data: { title: "My Site" },
});
console.log(html); // Full HTML output

// Parse document structure for querying
const doc = parseNuemark(content);
console.log(doc.sections); // Array of sections
console.log(doc.headings); // All headings with hierarchy
console.log(doc.meta); // Front matter metadata
console.log(doc.blocks); // Parsed content blocks

// Render custom elements
const section = elem("section", { class: "hero" }, "Content here");
console.log(section); // <section class="hero">Content here</section>

// Process inline markdown only
const inline = renderInline("This is **bold** and [link](url)");
console.log(inline); // This is <strong>bold</strong> and <a href="url">link</a>
```

## Nueserver: Edge-First HTTP Server with Global Route Handlers

Nueserver provides a minimal HTTP server API designed for edge deployment, using global functions instead of framework imports.

```javascript
// In your server route file (e.g., api.js)

// GET endpoint with JSON response
get("/api/users", async (c) => {
  const users = await c.env.db.query("SELECT * FROM users");
  return c.json(users);
});

// GET with route parameters
get("/api/users/:id", async (c) => {
  const id = c.req.param("id");
  const user = await c.env.db.findOne("users", { id });
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json(user);
});

// POST with request body parsing
post("/api/users", async (c) => {
  const data = await c.req.json();

  // Validation
  if (!data.email) {
    return c.json({ error: "Email required" }, 400);
  }

  const user = await c.env.db.insert("users", data);
  return c.json(user, 201);
});

// Access query parameters
get("/api/search", async (c) => {
  const q = c.req.query("q");
  const page = c.req.query("page") || 1;
  const allParams = c.req.query(); // All query params as object

  const results = await c.env.db.search(q, { page });
  return c.json({ results, page });
});

// DELETE endpoint
del("/api/users/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.db.delete("users", { id });
  return c.text("Deleted", 204);
});

// Middleware with use()
use("/api/admin/*", async (c, next) => {
  const token = c.req.header("authorization");

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Validate token
  const valid = await validateToken(token);
  if (!valid) {
    return c.json({ error: "Invalid token" }, 403);
  }

  await next(); // Continue to route handler
});

// CloudFlare edge features (mocked locally)
post("/api/contact", async (c) => {
  const country = c.req.header("cf-ipcountry");
  const ip = c.req.header("cf-connecting-ip");
  const city = c.req.header("cf-ipcity");

  const data = await c.req.json();

  await c.env.db.insert("contacts", {
    ...data,
    country,
    ip,
    city,
    timestamp: Date.now(),
  });

  return c.json({ success: true, country });
});

// Error handling
post("/api/process", async (c) => {
  try {
    const data = await c.req.json();
    const result = await processData(data);
    return c.json(result);
  } catch (error) {
    console.error("Processing error:", error);
    return c.json({ error: error.message }, 500);
  }
});
```

## Nuestate: URL-First State Management with Automatic Routing

Nuestate synchronizes application state with the URL automatically, enabling bookmarking, sharing, and browser navigation without manual sync code.

```javascript
import { state } from "nuestate";

// Configure state contexts
state.setup({
  route: "/app/:section/:id", // URL path parameters
  query: ["search", "filter", "page"], // Query string parameters
  session: ["user", "token"], // sessionStorage
  local: ["theme", "language"], // localStorage
  memory: ["results", "loading"], // In-memory only
  emit_only: ["notification"], // Emit events without storage
  autolink: true, // Convert <a> tags to SPA navigation
});

// Read state (from any context)
console.log(state.section); // Read from URL path
console.log(state.search); // Read from query string
console.log(state.user); // Read from sessionStorage
console.log(state.theme); // Read from localStorage

// Write state (updates URL/storage automatically)
state.section = "products";
state.id = "123";
// URL becomes: /app/products/123

state.search = "laptop";
state.filter = "electronics";
// URL becomes: /app/products/123?search=laptop&filter=electronics

state.theme = "dark";
// Saves to localStorage

// Set multiple values atomically
state.set({
  section: "users",
  id: "456",
  search: "john",
  page: 2,
});
// URL becomes: /app/users/456?search=john&page=2

// Listen to state changes
state.on("search filter", async (changes) => {
  console.log("Search changed:", changes.search);
  console.log("Filter changed:", changes.filter);

  state.loading = true;
  const results = await fetch(
    `/api/search?q=${changes.search}&filter=${changes.filter}`
  ).then((r) => r.json());
  state.results = results;
  state.loading = false;
});

// Listen to multiple properties
state.on("section id", (changes) => {
  console.log("Route changed:", changes.section, changes.id);
  loadData(changes.section, changes.id);
});

// Emit events without storing
state.emit("notification", { text: "Saved!", type: "success" });

// Remove listener
const handler = (changes) => console.log(changes);
state.on("search", handler);
state.off("search", handler);

// Access all state data
console.log(state.data); // Returns object with all state properties

// Initialize state from URL (on app start)
state.init();

// Use in Nuedom components
const template = `
  <div>
    <input
      type="text"
      value="{ state.search }"
      :oninput="state.search = $event.target.value">

    <select :onchange="state.filter = $event.target.value">
      <option value="">All</option>
      <option value="electronics">Electronics</option>
      <option value="books">Books</option>
    </select>

    <div :if="state.loading">Loading...</div>

    <div :each="item in state.results">
      <h3>{ item.title }</h3>
      <p>{ item.description }</p>
    </div>
  </div>
`;
```

## Nueglow: CSS-First Syntax Highlighting with Semantic HTML

Nueglow generates semantic HTML elements for code syntax that your CSS can style, supporting all languages with a single universal parser.

````javascript
import { highlight } from "nue-glow";

// Highlight code for any language
const code = `
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
}
`;

const html = highlight(code, "javascript");
/* Returns semantic HTML:
<pre><code>
<b>function</b> calculateTotal(items) {
  <b>return</b> items.reduce((sum, item) <i>=></i> {
    <b>return</b> sum + (item.price * item.quantity)
  }, <strong>0</strong>)
}
</code></pre>
*/

// Style with CSS (in your design system)
const css = `
code b { color: #d73a49; font-weight: 600; }    /* keywords */
code em { color: #032f62; }                      /* strings */
code strong { color: #005cc5; }                  /* numbers */
code sup { color: #6a737d; font-style: italic; } /* comments */
code i { color: #d73a49; }                       /* operators */
`;

// Works with Python, HTML, CSS, JSON, YAML, SQL, Bash, etc.
const pythonCode = `
def greet(name):
    """Say hello"""
    print(f"Hello, {name}!")
`;
const pythonHtml = highlight(pythonCode, "python");

// Automatic language detection from markdown code blocks
const markdownCode = "```javascript\nconst x = 42\n```";
// Nuemark automatically applies Nueglow highlighting
````

## Nueyaml: Predictable YAML Parser Without Surprises

Nueyaml parses YAML with one rule: if it looks like a string to a human, it's a string. No type coercion surprises.

```javascript
import { parse } from "nueyaml";

// Parse YAML without surprises
const yaml = `
title: My Website
country: NO
time: 12:30
version: 1.10
port: 08080
enabled: true
count: 42
price: 19.99

features:
  - Fast
  - Simple
  - Predictable

contact:
  email: hello@example.com
  phone: 555-1234
`;

const data = parse(yaml);
console.log(data);
/* Returns:
{
  title: 'My Website',
  country: 'NO',        // string, not false
  time: '12:30',        // string, not 750 minutes
  version: 1.10,        // number (obvious number)
  port: '08080',        // string (leading zero)
  enabled: true,        // boolean (only true/false)
  count: 42,            // number
  price: 19.99,         // number
  features: ['Fast', 'Simple', 'Predictable'],
  contact: {
    email: 'hello@example.com',
    phone: '555-1234'
  }
}
*/

// Configuration files stay predictable
const siteConfig = `
name: My Site
url: https://example.com
port: 3000
ssl: true

build:
  output: .dist
  clean: true

routes:
  - path: /api/*
    handler: ./api.js
  - path: /
    static: true
`;

const config = parse(siteConfig);
// All values are exactly what they appear to be
```

## Nuekit Configuration: Site-Wide Settings via site.yaml

Configure your entire Nue project through a simple YAML configuration file at the root.

```yaml
# site.yaml - Project configuration

# Site metadata
title: My Website
description: A modern website built with Nue
url: https://example.com

# Development server
port: 8080
root: ./src

# Build settings
dist: ./.dist
ignore:
  - node_modules
  - .git
  - "*.test.js"

# Hot module replacement
hmr: true

# Sitemap generation
sitemap:
  enabled: true
  exclude:
    - /admin/*
    - /api/*

# RSS feed
rss:
  enabled: true
  title: My Blog
  description: Latest posts
  path: /feed.xml

# Global data available to all pages
globals:
  brand: Acme Corp
  year: 2024
  social:
    twitter: "@acme"
    github: "acme"

# Component libraries
libs:
  - ./components/*.html
  - ./layouts/*.html

# Server routes
server: ./api.js
```

## Primary Use Cases and Application Patterns

Nue excels at three primary use cases: content-focused websites, single-page applications, and full-stack web applications. For content sites like blogs, documentation, and marketing pages, Nuemark provides the authoring environment while Nuekit handles the build pipeline—write markdown with enhanced syntax, define layouts once, and let the design system provide consistency across all pages. For SPAs, Nuedom delivers reactive UI assembly with semantic HTML templates and Nuestate manages client-side routing and state synchronization through the URL. For full-stack applications, combine all components: Nueserver handles API routes with edge-compatible patterns, Nuestate synchronizes frontend state, and Nuedom renders interactive interfaces.

The integration pattern follows clear boundaries: content authors work in Nuemark files, designers work in CSS with design systems, and developers work in JavaScript modules and HTML templates. This separation eliminates the "full-stack developer" bottleneck where every change requires deep framework knowledge. The build system watches all file types with universal hot reload, so content changes, CSS updates, and JavaScript modifications all trigger instant browser updates. Deploy the static build output to any CDN for content sites, or deploy Nueserver routes to CloudFlare Workers for edge computing. The entire system weighs 1MB globally installed, replacing 500MB+ node_modules folders with a single minimal toolkit that prioritizes web standards over framework abstractions.
