# Hugo - Static Site Generator

## Introduction

Hugo is a fast and flexible static site generator written in Go, optimized for speed and designed for flexibility. With its advanced templating system and fast asset pipelines, Hugo renders complete sites in seconds, often less. It transforms content files (Markdown, HTML, etc.) into static websites that can be deployed anywhere, utilizing a powerful templating engine based on Go's html/template and text/template packages.

Hugo provides a comprehensive framework for building modern websites including corporate sites, documentation, blogs, portfolios, and landing pages. It features built-in support for multilingual sites, powerful taxonomy systems, image processing pipelines, JavaScript/TypeScript bundling via esbuild, Sass/SCSS compilation, and a modular architecture through Hugo Modules. The system uses a watch-and-rebuild development server with LiveReload for instant feedback during content creation and design work.

## CLI Commands

### Build Command
Build your Hugo site into static files.

```bash
# Basic build
hugo

# Build with specific configuration
hugo --config config.toml

# Build for production environment
hugo --environment production

# Build with specific destination
hugo --destination public

# Enable minification
hugo --minify

# Build drafts and future content
hugo --buildDrafts --buildFuture

# Clean destination before build
hugo --cleanDestinationDir
```

### Server Command
Run the Hugo development server with LiveReload.

```bash
# Start server on default port 1313
hugo server

# Start on specific port
hugo server --port 8080

# Bind to specific interface
hugo server --bind 0.0.0.0

# Enable navigation to draft/future/expired content
hugo server --buildDrafts --buildFuture --buildExpired

# Disable LiveReload
hugo server --disableLiveReload

# Enable fast render mode (only rebuild changed pages)
hugo server --disableFastRender=false

# Navigate directly to changed content
hugo server --navigateToChanged

# Watch filesystem for changes
hugo server --watch

# Start with HTTPS (self-signed certificate)
hugo server --cert mycert.pem --key mykey.pem
```

### New Command
Create new content files from archetypes.

```bash
# Create new content file
hugo new posts/my-first-post.md

# Create new site
hugo new site mysite

# Create content in specific section
hugo new blog/article.md

# Use specific archetype
hugo new posts/post.md --kind post

# Create content from specific config
hugo new content posts/article.md --config myconfig.toml
```

### Module Commands
Manage Hugo Modules for dependency management.

```bash
# Initialize new module
hugo mod init github.com/user/mysite

# Get/update dependencies
hugo mod get -u

# Vendor all module dependencies
hugo mod vendor

# List all module dependencies
hugo mod graph

# Clean module cache
hugo mod clean

# Verify module dependencies
hugo mod verify

# Update go.mod
hugo mod tidy

# Get specific module version
hugo mod get github.com/user/module@v1.2.3
```

### Configuration Commands
Manage and inspect Hugo configuration.

```bash
# Print site configuration
hugo config

# Print configuration in JSON format
hugo config --format json

# Mount configuration inspection
hugo config mounts

# Print configuration for specific environment
hugo config --environment production
```

### Deployment Command
Deploy site to cloud storage providers.

```bash
# Deploy to configured target
hugo deploy

# Deploy with confirmation prompts
hugo deploy --confirm

# Dry run (show what would be deployed)
hugo deploy --dryRun

# Deploy to specific target
hugo deploy --target production

# Force upload all files
hugo deploy --force

# Invalidate CDN cache
hugo deploy --invalidateCDN

# Set max concurrent uploads
hugo deploy --maxDeletes 256
```

## Core Site Building API

### Creating and Building Sites
Initialize and build Hugo sites programmatically.

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/gohugoio/hugo/config"
    "github.com/gohugoio/hugo/config/allconfig"
    "github.com/gohugoio/hugo/deps"
    "github.com/gohugoio/hugo/hugolib"
    "github.com/spf13/afero"
)

func main() {
    // Create filesystem
    fs := afero.NewOsFs()

    // Load configuration
    configProvider, err := allconfig.LoadConfig(allconfig.ConfigSourceDescriptor{
        Fs:          fs,
        Path:        "config.toml",
        Environment: "production",
    })
    if err != nil {
        log.Fatal(err)
    }

    // Create dependencies
    depsCfg := deps.DepsCfg{
        Fs:      fs,
        Cfg:     configProvider,
        Logger:  loggers.NewDefault(),
    }

    // Build site
    sites, err := hugolib.NewHugoSites(depsCfg)
    if err != nil {
        log.Fatal(err)
    }

    // Execute build
    err = sites.Build(hugolib.BuildCfg{
        SkipRender: false,
        PrintStats: true,
    })
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Built %d pages\n", len(sites.Pages()))
}
```

### Accessing Page Content
Work with page data and metadata.

```go
package main

import (
    "fmt"
    "github.com/gohugoio/hugo/resources/page"
)

// Page processing example
func processPage(p page.Page) {
    // Get page metadata
    title := p.Title()
    date := p.Date()
    permalink := p.Permalink()

    // Access front matter parameters
    tags, _ := p.Param("tags").([]string)
    author := p.Params()["author"]

    // Get page content
    content := p.Content()
    summary := p.Summary()
    wordCount := p.WordCount()
    readingTime := p.ReadingTime()

    // Page relationships
    parent := p.Parent()
    sections := p.Sections()

    // Output formats
    for _, outputFormat := range p.OutputFormats() {
        fmt.Printf("Format: %s, Permalink: %s\n",
            outputFormat.Name,
            outputFormat.Permalink())
    }

    // Resources (images, files, etc.)
    for _, resource := range p.Resources().ByType("image") {
        fmt.Printf("Image: %s\n", resource.RelPermalink())
    }

    fmt.Printf("Page: %s\n", title)
    fmt.Printf("Date: %s\n", date)
    fmt.Printf("URL: %s\n", permalink)
    fmt.Printf("Tags: %v\n", tags)
    fmt.Printf("Author: %v\n", author)
    fmt.Printf("Words: %d\n", wordCount)
    fmt.Printf("Reading time: %d min\n", readingTime)
}
```

## Template Functions

### Collections Functions
Manipulate arrays, slices, and maps in templates.

```go
{{ /* After - Get items after first n */ }}
{{ $pages := .Site.RegularPages }}
{{ range after 5 $pages }}
  <article>{{ .Title }}</article>
{{ end }}

{{ /* First - Get first n items */ }}
{{ range first 10 .Site.RegularPages }}
  <li>{{ .Title }}</li>
{{ end }}

{{ /* Last - Get last n items */ }}
{{ range last 3 .Site.RegularPages }}
  <li>{{ .Title }}</li>
{{ end }}

{{ /* Where - Filter collection */ }}
{{ $posts := where .Site.RegularPages "Type" "posts" }}
{{ $featured := where $posts "Params.featured" true }}
{{ $recent := where $posts "Date" "ge" (now.AddDate 0 -1 0) }}

{{ /* Delimit - Join array elements */ }}
{{ $tags := slice "hugo" "golang" "web" }}
{{ delimit $tags ", " " and " }}
<!-- Output: hugo, golang and web -->

{{ /* Sort - Sort collection */ }}
{{ range sort .Pages "Date" "desc" }}
  <article>{{ .Title }} - {{ .Date }}</article>
{{ end }}

{{ /* Group - Group collection */ }}
{{ range .Pages.GroupByDate "2006-01" }}
  <h2>{{ .Key }}</h2>
  {{ range .Pages }}
    <li>{{ .Title }}</li>
  {{ end }}
{{ end }}

{{ /* Union - Combine slices */ }}
{{ $s1 := slice "a" "b" "c" }}
{{ $s2 := slice "c" "d" "e" }}
{{ $result := union $s1 $s2 }}
<!-- Result: [a b c d e] -->

{{ /* Intersect - Common elements */ }}
{{ $common := intersect $s1 $s2 }}
<!-- Result: [c] -->

{{ /* Dictionary (dict) - Create map */ }}
{{ $data := dict "name" "Hugo" "version" "0.120.0" "lang" "Go" }}
{{ $data.name }} {{ $data.version }}

{{ /* Slice - Create slice */ }}
{{ $items := slice "apple" "banana" "cherry" }}
{{ range $items }}
  <li>{{ . }}</li>
{{ end }}

{{ /* Index - Access by key/index */ }}
{{ $colors := slice "red" "green" "blue" }}
{{ index $colors 1 }}  <!-- green -->
{{ index .Params "author" }}

{{ /* In - Check membership */ }}
{{ if in .Params.tags "hugo" }}
  <span class="badge">Hugo</span>
{{ end }}

{{ /* Shuffle - Randomize order */ }}
{{ range shuffle .Site.RegularPages }}
  <div>{{ .Title }}</div>
{{ end }}

{{ /* Uniq - Remove duplicates */ }}
{{ $tags := slice "hugo" "go" "hugo" "web" }}
{{ $unique := uniq $tags }}
<!-- Result: [hugo go web] -->
```

### String Functions
Process and manipulate strings in templates.

```go
{{ /* String transformation */ }}
{{ $text := "Hugo Static Site Generator" }}

{{ /* Case conversion */ }}
{{ lower $text }}  <!-- hugo static site generator -->
{{ upper $text }}  <!-- HUGO STATIC SITE GENERATOR -->
{{ title $text }}  <!-- Hugo Static Site Generator -->

{{ /* Humanize - Make readable */ }}
{{ humanize "my-var-name" }}  <!-- My var name -->

{{ /* Trim operations */ }}
{{ $padded := "  hello world  " }}
{{ trim $padded " " }}  <!-- hello world -->
{{ strings.TrimPrefix "https://" "https://example.com" }}
{{ strings.TrimSuffix ".md" "content.md" }}

{{ /* Replace */ }}
{{ replace "Hello World" "World" "Hugo" }}  <!-- Hello Hugo -->
{{ replaceRE "^https?://[^/]+" "" .Permalink }}

{{ /* Split and join */ }}
{{ $path := "content/posts/article.md" }}
{{ $parts := split $path "/" }}
{{ range $parts }}{{ . }} {{ end }}

{{ /* Contains and hasPrefix */ }}
{{ if strings.Contains .Title "Hugo" }}
  <span>Hugo content!</span>
{{ end }}
{{ if hasPrefix .File.Path "blog/" }}
  <nav>Blog Navigation</nav>
{{ end }}

{{ /* Count operations */ }}
{{ $content := "Hugo is a fast static site generator" }}
{{ countwords $content }}  <!-- 7 -->
{{ countrunes $content }}  <!-- 37 -->

{{ /* Substring */ }}
{{ substr "Hello Hugo" 0 5 }}  <!-- Hello -->
{{ substr "Hello Hugo" 6 }}    <!-- Hugo -->

{{ /* Truncate with ellipsis */ }}
{{ $long := "This is a very long sentence that needs truncation" }}
{{ truncate 20 $long }}  <!-- This is a very long... -->
{{ truncate 20 "..." $long }}
```

### Resource Functions
Process assets like images, CSS, JavaScript, and data files.

```go
{{ /* Get resource from assets directory */ }}
{{ $image := resources.Get "images/photo.jpg" }}
{{ $style := resources.Get "css/main.scss" }}
{{ $script := resources.Get "js/app.js" }}

{{ /* Image processing */ }}
{{ $resized := $image.Resize "600x400" }}
{{ $filled := $image.Fill "800x600 Center" }}
{{ $fitted := $image.Fit "1200x800" }}
{{ $filtered := $image.Filter (images.Brightness 20) (images.Contrast 15) }}

<img src="{{ $resized.RelPermalink }}"
     width="{{ $resized.Width }}"
     height="{{ $resized.Height }}"
     alt="Processed image">

{{ /* Convert image format */ }}
{{ $webp := $image.Resize "800x webp" }}
{{ $png := $image.Resize "400x png" }}

{{ /* Image processing chain */ }}
{{ $processed := $image.Resize "1200x"
    | images.Filter (images.GaussianBlur 5)
    | images.Filter (images.Brightness 10) }}

{{ /* Sass/SCSS to CSS */ }}
{{ $style := resources.Get "sass/main.scss" }}
{{ $css := $style | toCSS (dict "outputStyle" "compressed") }}
{{ with $css }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}

{{ /* JavaScript bundling with esbuild */ }}
{{ $js := resources.Get "js/main.js" }}
{{ $built := $js | js.Build (dict
    "minify" true
    "target" "es2018"
    "format" "iife"
) }}
<script src="{{ $built.RelPermalink }}"></script>

{{ /* TypeScript compilation */ }}
{{ $ts := resources.Get "ts/app.ts" }}
{{ $js := $ts | js.Build (dict "target" "es2020") }}

{{ /* Fingerprinting for cache busting */ }}
{{ $style := resources.Get "css/main.css" }}
{{ $hashed := $style | fingerprint "sha256" }}
<link rel="stylesheet"
      href="{{ $hashed.RelPermalink }}"
      integrity="{{ $hashed.Data.Integrity }}">

{{ /* Minification */ }}
{{ $css := resources.Get "css/main.css" | minify }}
{{ $js := resources.Get "js/app.js" | minify }}
{{ $html := .Content | minify }}

{{ /* Resource concatenation */ }}
{{ $js1 := resources.Get "js/lib1.js" }}
{{ $js2 := resources.Get "js/lib2.js" }}
{{ $bundle := slice $js1 $js2 | resources.Concat "js/bundle.js" }}

{{ /* Remote resources */ }}
{{ $data := resources.GetRemote "https://api.example.com/data.json" }}
{{ with $data }}
  {{ if .Err }}
    {{ errorf "Failed to fetch: %s" .Err }}
  {{ else }}
    {{ $json := .Content | transform.Unmarshal }}
    {{ range $json.items }}
      <div>{{ .title }}</div>
    {{ end }}
  {{ end }}
{{ end }}

{{ /* PostCSS processing */ }}
{{ $css := resources.Get "css/main.css" }}
{{ $processed := $css | postCSS (dict
    "config" "./postcss.config.js"
    "noMap" false
) }}

{{ /* Match multiple resources */ }}
{{ $scripts := resources.Match "js/modules/*.js" }}
{{ range $scripts }}
  <script src="{{ .RelPermalink }}"></script>
{{ end }}
```

### Data File Functions
Access and manipulate data from data files.

```go
{{ /* Access data files (YAML, JSON, TOML) */ }}
{{ /* data/authors.json:
{
  "john": {
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Developer"
  },
  "jane": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "bio": "Designer"
  }
}
*/}}

{{ $authors := .Site.Data.authors }}
{{ with index $authors "john" }}
  <div class="author">
    <h3>{{ .name }}</h3>
    <p>{{ .email }}</p>
    <p>{{ .bio }}</p>
  </div>
{{ end }}

{{ /* Nested data structures */ }}
{{ /* data/products/software.yaml:
featured:
  - name: "Hugo"
    version: "0.120.0"
    license: "Apache 2.0"
  - name: "Go"
    version: "1.21"
    license: "BSD"
*/}}

{{ range .Site.Data.products.software.featured }}
  <div class="product">
    <h4>{{ .name }} v{{ .version }}</h4>
    <span>License: {{ .license }}</span>
  </div>
{{ end }}

{{ /* Transform data */ }}
{{ $json := `{"title": "Hello", "count": 42}` }}
{{ $data := $json | transform.Unmarshal }}
{{ $data.title }} - {{ $data.count }}

{{ /* Remote data */ }}
{{ $data := getJSON "https://api.example.com/posts" }}
{{ range first 5 $data }}
  <article>{{ .title }}</article>
{{ end }}

{{ /* CSV data with headers */ }}
{{ $csv := getCSV "," "https://example.com/data.csv" }}
{{ range $csv }}
  <tr>
    {{ range . }}<td>{{ . }}</td>{{ end }}
  </tr>
{{ end }}
```

### URL and Link Functions
Generate and manipulate URLs and links.

```go
{{ /* Relative and absolute URLs */ }}
{{ $path := "images/logo.png" }}
{{ relURL $path }}  <!-- /images/logo.png -->
{{ absURL $path }}  <!-- https://example.com/images/logo.png -->

{{ /* Language-specific URLs */ }}
{{ $page.RelPermalink }}
{{ $page.Permalink }}

{{ /* Reference content pages */ }}
{{ $related := .Site.GetPage "/blog/related-post" }}
<a href="{{ $related.RelPermalink }}">{{ $related.Title }}</a>

{{ /* ref and relref for cross-references */ }}
{{ with .Site.GetPage "blog/my-post.md" }}
  <a href="{{ .RelPermalink }}">Read more</a>
{{ end }}

{{ /* URL parsing and building */ }}
{{ $url := urls.Parse "https://example.com/path?key=value" }}
{{ $url.Scheme }}  <!-- https -->
{{ $url.Host }}    <!-- example.com -->
{{ $url.Path }}    <!-- /path -->
```

### Math and Comparison Functions
Perform calculations and comparisons.

```go
{{ /* Arithmetic */ }}
{{ add 5 3 }}      <!-- 8 -->
{{ sub 10 4 }}     <!-- 6 -->
{{ mul 6 7 }}      <!-- 42 -->
{{ div 20 4 }}     <!-- 5 -->
{{ mod 17 5 }}     <!-- 2 -->

{{ /* Chaining operations */ }}
{{ $result := add 10 (mul 5 2) }}  <!-- 20 -->

{{ /* Comparison */ }}
{{ eq .Type "posts" }}
{{ ne .Draft true }}
{{ lt .WordCount 500 }}
{{ le .ReadingTime 5 }}
{{ gt .Date.Year 2023 }}
{{ ge .Params.rating 4.5 }}

{{ /* Conditional logic */ }}
{{ if and (eq .Type "posts") (not .Draft) }}
  <article>{{ .Content }}</article>
{{ end }}

{{ if or (eq .Section "blog") (eq .Section "news") }}
  <nav>Blog Navigation</nav>
{{ end }}

{{ /* Math functions */ }}
{{ math.Ceil 4.2 }}    <!-- 5 -->
{{ math.Floor 4.8 }}   <!-- 4 -->
{{ math.Round 4.5 }}   <!-- 5 -->
{{ math.Max 10 20 }}   <!-- 20 -->
{{ math.Min 10 20 }}   <!-- 10 -->
{{ math.Pow 2 8 }}     <!-- 256 -->
{{ math.Sqrt 144 }}    <!-- 12 -->
```

### Time and Date Functions
Work with dates and times.

```go
{{ /* Current time */ }}
{{ now.Format "2006-01-02" }}
{{ now.Format "January 2, 2006" }}
{{ now.Unix }}

{{ /* Page dates */ }}
{{ .Date.Format "Jan 2, 2006" }}
{{ .PublishDate.Format "2006-01-02" }}
{{ .Lastmod.Format "Monday, January 2, 2006" }}

{{ /* Time manipulation */ }}
{{ $tomorrow := now.AddDate 0 0 1 }}
{{ $lastMonth := now.AddDate 0 -1 0 }}
{{ $nextYear := now.AddDate 1 0 0 }}

{{ /* Duration */ }}
{{ $duration := sub now.Unix .Date.Unix }}

{{ /* Time comparison */ }}
{{ if .Date.After (now.AddDate 0 -6 0) }}
  <span class="badge">Recent</span>
{{ end }}

{{ /* Date parsing */ }}
{{ $date := time "2024-01-15" }}
{{ $date.Year }}   <!-- 2024 -->
{{ $date.Month }}  <!-- January -->
{{ $date.Day }}    <!-- 15 -->

{{ /* Timezone handling */ }}
{{ $date := time.AsTime .Params.eventDate }}
{{ $date.In "America/New_York" }}
```

### Partial Templates
Include reusable template components.

```go
{{ /* Basic partial */ }}
{{ partial "header.html" . }}
{{ partial "footer.html" . }}

{{ /* Partial with context */ }}
{{ partial "author-bio.html" .Params.author }}

{{ /* Partial with custom dict */ }}
{{ partial "card.html" (dict
    "title" .Title
    "content" .Summary
    "link" .RelPermalink
    "image" .Params.image
) }}

{{ /* Cached partial (for expensive operations) */ }}
{{ partialCached "sidebar.html" . .Section }}
{{ partialCached "tag-cloud.html" . .Site.LastChange }}

{{ /* Partial with variant */ }}
{{ partial "comments.html" (dict "page" . "variant" "compact") }}

{{ /* Return value from partial */ }}
{{ /* layouts/partials/get-reading-time.html:
{{ $words := .WordCount }}
{{ $wpm := 200 }}
{{ return (div $words $wpm) }}
*/}}

{{ $time := partial "get-reading-time.html" . }}
<span>{{ $time }} min read</span>
```

### Format and Output Functions
Control output formatting and encoding.

```go
{{ /* String formatting */ }}
{{ printf "%s - %d views" .Title .Params.views }}
{{ printf "Page %d of %d" .Paginator.PageNumber .Paginator.TotalPages }}

{{ /* JSON output */ }}
{{ $data := dict "title" .Title "date" .Date "tags" .Params.tags }}
{{ $data | jsonify }}
{{ $data | jsonify (dict "indent" "  ") }}

{{ /* HTML encoding */ }}
{{ htmlEscape .Content }}
{{ htmlUnescape .Params.rawHTML }}

{{ /* URL encoding */ }}
{{ $query := querify "search" .Title "category" .Type }}
<!-- search=My+Title&category=posts -->

{{ /* Base64 encoding */ }}
{{ $text := "Hello Hugo" | base64Encode }}
{{ $decoded := $text | base64Decode }}

{{ /* Markdown to HTML */ }}
{{ .Content }}
{{ .RawContent | markdownify }}
{{ .Summary }}

{{ /* Template execution */ }}
{{ $tmpl := `{{ . | upper }}` }}
{{ $result := $tmpl | templates.Defer (dict "Data" "hello") }}

{{ /* Safe HTML (prevent escaping) */ }}
{{ .Content | safeHTML }}
{{ .Params.svgIcon | safeHTML }}
{{ .Params.inlineCSS | safeCSS }}
{{ .Params.inlineJS | safeJS }}
```

### Taxonomy Functions
Work with categories, tags, and custom taxonomies.

```go
{{ /* Access all taxonomies */ }}
{{ range .Site.Taxonomies.tags }}
  <div class="tag">
    <a href="{{ .Page.RelPermalink }}">{{ .Page.Title }}</a>
    <span class="count">{{ .Count }}</span>
  </div>
{{ end }}

{{ /* Get pages with specific term */ }}
{{ $tagPages := .Site.Taxonomies.tags.hugo }}
{{ range $tagPages }}
  <article>{{ .Title }}</article>
{{ end }}

{{ /* Page taxonomy access */ }}
{{ range .Params.tags }}
  <span class="tag">{{ . }}</span>
{{ end }}

{{ /* Get taxonomy page */ }}
{{ $tag := .Site.GetPage (printf "/tags/%s" "hugo") }}
<a href="{{ $tag.RelPermalink }}">All Hugo posts ({{ len $tag.Pages }})</a>

{{ /* Related content by taxonomy */ }}
{{ $related := .Site.RegularPages.Related . | first 5 }}
{{ range $related }}
  <article>
    <h3>{{ .Title }}</h3>
    <p>{{ .Summary }}</p>
  </article>
{{ end }}
```

## Configuration System

### Basic Configuration
Configure Hugo site settings using TOML, YAML, or JSON.

```toml
# config.toml - Site configuration

baseURL = "https://example.com/"
languageCode = "en-us"
title = "My Hugo Site"
theme = "mytheme"

# Build settings
[build]
  writeStats = true
  useResourceCacheWhen = "fallback"

[build.buildStats]
  enable = true

# Content settings
[permalinks]
  posts = "/:year/:month/:slug/"
  blog = "/blog/:title/"

# Taxonomy configuration
[taxonomies]
  tag = "tags"
  category = "categories"
  series = "series"

# Menu configuration
[[menus.main]]
  name = "Home"
  url = "/"
  weight = 1

[[menus.main]]
  name = "Blog"
  url = "/blog/"
  weight = 2

[[menus.main]]
  name = "About"
  url = "/about/"
  weight = 3

# Custom parameters
[params]
  author = "John Doe"
  description = "A Hugo-powered site"
  twitter = "johndoe"
  github = "johndoe"

[params.social]
  twitter = "https://twitter.com/johndoe"
  github = "https://github.com/johndoe"
  linkedin = "https://linkedin.com/in/johndoe"

# Output formats
[outputs]
  home = ["HTML", "RSS", "JSON"]
  section = ["HTML", "RSS"]
  page = ["HTML"]

# Media types
[mediaTypes]
  [mediaTypes."application/manifest+json"]
    suffixes = ["webmanifest"]

# Custom output formats
[outputFormats]
  [outputFormats.SearchIndex]
    mediaType = "application/json"
    baseName = "search"
    isPlainText = true
    notAlternative = true

# Image processing defaults
[imaging]
  resampleFilter = "Lanczos"
  quality = 85
  anchor = "Smart"

# Markup configuration
[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
  [markup.highlight]
    anchorLineNos = false
    codeFences = true
    guessSyntax = false
    hl_Lines = ""
    lineAnchors = ""
    lineNoStart = 1
    lineNos = false
    lineNumbersInTable = true
    noClasses = true
    style = "monokai"
    tabWidth = 4

# Privacy settings
[privacy]
  [privacy.googleAnalytics]
    disable = false
    anonymizeIP = true
    respectDoNotTrack = true
  [privacy.youtube]
    privacyEnhanced = true

# Security settings
[security]
  [security.exec]
    allow = ['^dart-sass-embedded$', '^go$', '^npx$', '^postcss$']
  [security.funcs]
    getenv = ['^HUGO_', '^CI$']
```

### Multi-language Configuration
Configure multilingual sites.

```toml
# config.toml

defaultContentLanguage = "en"
defaultContentLanguageInSubdir = false

[languages]
  [languages.en]
    languageName = "English"
    contentDir = "content/en"
    weight = 1
    title = "My Hugo Site"
    [languages.en.params]
      description = "Welcome to my site"
    [[languages.en.menus.main]]
      name = "Home"
      url = "/"
      weight = 1
    [[languages.en.menus.main]]
      name = "About"
      url = "/about/"
      weight = 2

  [languages.es]
    languageName = "Español"
    contentDir = "content/es"
    weight = 2
    title = "Mi Sitio Hugo"
    [languages.es.params]
      description = "Bienvenido a mi sitio"
    [[languages.es.menus.main]]
      name = "Inicio"
      url = "/"
      weight = 1
    [[languages.es.menus.main]]
      name = "Acerca de"
      url = "/about/"
      weight = 2

  [languages.fr]
    languageName = "Français"
    contentDir = "content/fr"
    weight = 3
    title = "Mon Site Hugo"
```

### Module Configuration
Configure Hugo Modules for dependency management.

```toml
# config.toml

[module]
  # Proxy configuration
  proxy = "direct"
  noProxy = "none"
  private = "*.*"

  # Module workspace
  workspace = "hugo.work"

  # Import modules
  [[module.imports]]
    path = "github.com/user/theme"
    disable = false

  [[module.imports]]
    path = "github.com/user/component"
    [[module.imports.mounts]]
      source = "layouts"
      target = "layouts"
    [[module.imports.mounts]]
      source = "static"
      target = "static"
      excludeFiles = "*.draft"

  # Module replacements
  [[module.replacements]]
    old = "github.com/user/oldmodule"
    new = "github.com/user/newmodule"

  # Mount configuration
  [[module.mounts]]
    source = "content"
    target = "content"

  [[module.mounts]]
    source = "static"
    target = "static"

  [[module.mounts]]
    source = "layouts"
    target = "layouts"

  [[module.mounts]]
    source = "data"
    target = "data"

  [[module.mounts]]
    source = "assets"
    target = "assets"

  [[module.mounts]]
    source = "i18n"
    target = "i18n"

  [[module.mounts]]
    source = "archetypes"
    target = "archetypes"
```

### Environment-Specific Configuration
Use different settings per environment.

```toml
# config/_default/config.toml
baseURL = "http://localhost:1313/"
title = "My Site"
buildDrafts = true
buildFuture = true

# config/production/config.toml
baseURL = "https://example.com/"
buildDrafts = false
buildFuture = false
enableGitInfo = true

[minify]
  disableCSS = false
  disableHTML = false
  disableJS = false
  disableJSON = false
  disableSVG = false
  disableXML = false
  minifyOutput = true

# config/production/params.toml
[params]
  googleAnalytics = "UA-XXXXXXXXX-X"
  environment = "production"

# config/staging/config.toml
baseURL = "https://staging.example.com/"
buildDrafts = true
enableRobotsTXT = true

[params]
  environment = "staging"
```

### Deployment Configuration
Configure deployment targets.

```toml
# config.toml

[deployment]
  # S3-compatible deployment
  [[deployment.targets]]
    name = "production"
    URL = "s3://my-bucket?region=us-east-1"
    cloudFrontDistributionID = "EXAMPLEID"

  [[deployment.targets]]
    name = "staging"
    URL = "s3://my-staging-bucket?region=us-west-2"

  # Google Cloud Storage
  [[deployment.targets]]
    name = "gcs-production"
    URL = "gs://my-bucket"

  # Azure Blob Storage
  [[deployment.targets]]
    name = "azure"
    URL = "azure://my-container"

  # Matchers for file handling
  [[deployment.matchers]]
    # Cache static assets for 1 year
    pattern = "^.+\\.(js|css|svg|ttf|woff|woff2)$"
    cacheControl = "max-age=31536000, no-transform, public"
    gzip = true

  [[deployment.matchers]]
    pattern = "^.+\\.(png|jpg|jpeg|gif|webp)$"
    cacheControl = "max-age=31536000, no-transform, public"
    gzip = false

  [[deployment.matchers]]
    # HTML files - short cache
    pattern = "^.+\\.(html|xml|json)$"
    cacheControl = "max-age=3600, no-transform, public"
    gzip = true
    contentType = "text/html; charset=utf-8"
```

## Page Front Matter

### Standard Front Matter
Configure individual content pages.

```yaml
---
# Page metadata
title: "My Blog Post"
date: 2024-01-15T10:00:00-05:00
lastmod: 2024-01-20T14:30:00-05:00
publishDate: 2024-01-15T10:00:00-05:00
expiryDate: 2025-01-15T10:00:00-05:00

# Content classification
draft: false
type: "posts"
layout: "single"
slug: "my-custom-slug"
url: "/custom/url/path/"

# Taxonomies
tags:
  - hugo
  - golang
  - web development
categories:
  - Technology
  - Programming
series:
  - Hugo Tutorials

# Page description
description: "A comprehensive guide to using Hugo static site generator"
summary: "Learn how to build fast, modern websites with Hugo"
keywords:
  - static site
  - JAMstack
  - web performance

# Author information
author: "John Doe"
authors:
  - "John Doe"
  - "Jane Smith"

# Images
images:
  - /images/featured.jpg
  - /images/og-image.jpg

# Related content weights
weight: 10

# Site features
featured: true
toc: true
comments: true
share: true

# Cascading settings for section
cascade:
  - type: "posts"
    params:
      featured_image: "/images/default-post.jpg"

# Output formats
outputs:
  - HTML
  - JSON
  - AMP

# Custom parameters
params:
  reading_time: 5
  difficulty: intermediate
  repo_url: "https://github.com/user/repo"
  affiliate: false
---

Your content goes here in Markdown format.
```

### Resource Metadata
Configure page resources (images, files).

```yaml
---
title: "Gallery Page"
date: 2024-01-15
resources:
  - src: "*.jpg"
    name: "gallery-:counter"
    title: "Gallery Image :counter"
    params:
      credits: "Photo by John Doe"

  - src: "featured.jpg"
    name: "featured"
    title: "Featured Image"
    params:
      alt: "Article featured image"

  - src: "documents/*.pdf"
    name: "doc-:counter"
    title: "Document :counter"
    params:
      icon: "pdf"
---

Content with page resources that can be accessed via:
{{ range .Resources.ByType "image" }}
  {{ .Title }} - {{ .Params.credits }}
{{ end }}
```

## Content Organization

### Directory Structure
Standard Hugo project layout.

```
mysite/
├── archetypes/          # Content templates
│   ├── default.md
│   └── posts.md
├── assets/              # Files to be processed (SCSS, JS, images)
│   ├── css/
│   ├── js/
│   └── images/
├── content/             # Content files
│   ├── _index.md       # Homepage content
│   ├── about.md
│   ├── posts/
│   │   ├── _index.md   # Posts section page
│   │   ├── post-1.md
│   │   └── post-2.md
│   └── blog/
├── data/                # Data files (JSON, YAML, TOML)
│   ├── authors.json
│   └── config/
├── layouts/             # Templates
│   ├── _default/
│   │   ├── baseof.html     # Base template
│   │   ├── list.html       # List pages
│   │   ├── single.html     # Single pages
│   │   └── home.html       # Homepage
│   ├── partials/
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── sidebar.html
│   ├── shortcodes/
│   │   ├── figure.html
│   │   └── youtube.html
│   └── index.html
├── static/              # Static files (copied as-is)
│   ├── images/
│   ├── fonts/
│   └── files/
├── themes/              # Installed themes
│   └── mytheme/
├── config.toml          # Site configuration
├── config/              # Split configuration
│   ├── _default/
│   │   ├── config.toml
│   │   ├── params.toml
│   │   └── menus.toml
│   └── production/
│       └── config.toml
└── go.mod              # Module dependencies
```

### Shortcodes
Create reusable content snippets.

```go
{{/* layouts/shortcodes/youtube.html */}}
<div class="youtube-wrapper">
  <iframe
    src="https://www.youtube.com/embed/{{ .Get 0 }}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

{{/* Usage in content: */}}
{{/* {{< youtube "dQw4w9WgXcQ" >}} */}}

{{/* layouts/shortcodes/figure.html */}}
{{ $src := .Get "src" }}
{{ $alt := .Get "alt" }}
{{ $caption := .Get "caption" }}
<figure>
  <img src="{{ $src }}" alt="{{ $alt }}">
  {{ with $caption }}
    <figcaption>{{ . }}</figcaption>
  {{ end }}
</figure>

{{/* Usage: */}}
{{/* {{< figure src="/images/photo.jpg" alt="Description" caption="Photo caption" >}} */}}

{{/* layouts/shortcodes/notice.html */}}
{{ $type := .Get "type" | default "info" }}
<div class="notice notice-{{ $type }}">
  {{ .Inner | markdownify }}
</div>

{{/* Usage with inner content: */}}
{{/* {{< notice type="warning" >}}
This is a **warning** message.
{{< /notice >}} */}}
```

## Summary

Hugo serves as a comprehensive solution for building modern static websites with exceptional performance characteristics. Its primary use cases span documentation sites, corporate websites, blogs, portfolios, and complex multi-language platforms. The framework excels in scenarios requiring fast build times, where even large sites with thousands of pages can be generated in seconds. Hugo's asset pipeline handles image optimization, JavaScript bundling, and CSS preprocessing natively, eliminating the need for separate build tools. The template system provides extensive built-in functions for content manipulation, data processing, and conditional rendering without requiring external plugins.

Integration patterns in Hugo leverage its modular architecture through Hugo Modules, allowing teams to share themes, components, and content across projects via Git repositories. The development workflow centers around the hugo server command providing instant LiveReload feedback, while production builds optimize assets through minification, fingerprinting, and CDN preparation. Hugo integrates seamlessly with modern deployment platforms (Netlify, Vercel, AWS S3, Google Cloud Storage, Azure) through its CLI or built-in deployment commands. Content management workflows support headless CMS integration through data files or API fetching, Git-based workflows for developer-focused teams, and taxonomy systems for complex content organization. The configuration cascade system enables environment-specific settings, while the multilingual support allows sophisticated internationalization without external dependencies.
