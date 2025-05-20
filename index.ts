import * as fs from 'fs'
import * as path from 'path'
import { markdownToHtml } from './src/util/markdown.js'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

type Page = {
  title: string
  intro: string
}

/**
 * Clear the dist directory and create the child directory.
 *
 * @returns void
 */
const clearDist = (): void => {
  if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
    fs.rmSync(path.resolve(__dirname, 'dist'), { recursive: true })
  }
  fs.mkdirSync(path.resolve(__dirname, 'dist'))
  fs.mkdirSync(path.resolve(__dirname, 'dist', 'public'))
  fs.mkdirSync(path.resolve(__dirname, 'dist', 'public', 'styles'))
  fs.mkdirSync(path.resolve(__dirname, 'dist', 'public', 'posts'))
}

/**
 * Get all posts and render them.
 *
 * @returns void
 */
const getPosts = (): void => {
  const posts = fs.readdirSync(path.resolve(__dirname, 'data', 'posts'))

  posts.forEach((post) => {
    const postMeta = fs
      .readFileSync(path.resolve(__dirname, 'data', 'posts', post, 'meta.json'))
      .toString()
    const postMetaJson = JSON.parse(postMeta)

    const postContent = fs
      .readFileSync(
        path.resolve(__dirname, 'data', 'posts', post, 'content.md'),
        'utf-8'
      )
      .toString()

    const postTemplate = fs
      .readFileSync(
        path.resolve(__dirname, 'src', 'templates', 'post', 'post.html'),
        'utf-8'
      )
      .toString()
    let postTemplateHtml = postTemplate.replace(
      '{{post_title}}',
      postMetaJson.title
    )

    // Convert markdown to HTML
    const postHtml = markdownToHtml(postContent)
    postTemplateHtml = postTemplateHtml.replace('{{post_content}}', postHtml)
    postTemplateHtml = postTemplateHtml.replace(
      /{{post_date}}/g,
      postMetaJson.date
    )

    const headerHtml = getHeaderTemplate()
    postTemplateHtml = postTemplateHtml.replace(
      '{{header_content}}',
      headerHtml
    )
    const footerHtml = getFooterTemplate()
    postTemplateHtml = postTemplateHtml.replace(
      '{{footer_content}}',
      footerHtml
    )

    fs.writeFileSync(
      path.resolve(
        __dirname,
        'dist',
        'public',
        'posts',
        `${postMetaJson.slug}.html`
      ),
      postTemplateHtml,
      'utf-8'
    )
  })
}

/**
 * Get all pages and render them.
 *
 * @returns void
 */
const getPages = (): void => {
  const pages = fs.readdirSync(path.resolve(__dirname, 'src', 'pages'))

  pages.forEach((page) => {
    let pageHtml = fs
      .readFileSync(path.resolve(__dirname, 'src', 'pages', page, 'page.html'))
      .toString()

    const data = getPageData(page)
    Object.keys(data).forEach((key) => {
      pageHtml = pageHtml.replace(`{{${key}}}`, data[key as keyof Page])
    })

    const postLoop = getPostLoop()
    pageHtml = pageHtml.replace('{{post_loop}}', postLoop)

    const templateHtml = getPageTemplate(page)
    let template = templateHtml.replace('{{page_content}}', pageHtml)

    const headerHtml = getHeaderTemplate()
    template = template.replace('{{header_content}}', headerHtml)

    const footerHtml = getFooterTemplate()
    template = template.replace('{{footer_content}}', footerHtml)

    fs.writeFileSync(
      path.resolve(__dirname, 'dist', 'public', `${page}.html`),
      template,
      'utf-8'
    )
  })
}

/**
 * Get the post loop.
 */
const getPostLoop = (): string => {
  const posts = fs.readdirSync(path.resolve(__dirname, 'data', 'posts'))
  let postLoop = ''
  posts.forEach((post) => {
    const postMeta = fs
      .readFileSync(path.resolve(__dirname, 'data', 'posts', post, 'meta.json'))
      .toString()
    const postMetaJson = JSON.parse(postMeta)

    const postContent = fs
      .readFileSync(
        path.resolve(__dirname, 'data', 'posts', post, 'content.md'),
        'utf-8'
      )
      .toString()
    const postTemplate = fs
      .readFileSync(
        path.resolve(
          __dirname,
          'src',
          'templates',
          'post',
          'post-excerpt.html'
        ),
        'utf-8'
      )
      .toString()
    let postTemplateHtml = postTemplate.replace(
      '{{post_title}}',
      postMetaJson.title
    )

    postTemplateHtml = postTemplateHtml.replace(
      '{{post_url}}',
      `/posts/${postMetaJson.slug}`
    )

    // Convert markdown to HTML and truncate after 2 paragraphs
    const postHtml = markdownToHtml(postContent)
    const paragraphs = postHtml.split(/<\/p>/i)
    const truncatedHtml = paragraphs
      .slice(0, 2)
      .map((p) => p + '</p>')
      .join('')
    postTemplateHtml = postTemplateHtml.replace('{{post_intro}}', truncatedHtml)
    postTemplateHtml = postTemplateHtml.replace(
      /{{post_date}}/g,
      postMetaJson.date
    )
    postLoop += postTemplateHtml
  })

  return postLoop
}

/**
 * Get the data for a page.
 *
 * @param page The page to get the data for.
 * @returns The data for the page.
 */
const getPageData = (page: string): Page => {
  const data: Page = JSON.parse(
    fs
      .readFileSync(
        path.resolve(__dirname, 'data', 'pages', `${page}.json`),
        'utf-8'
      )
      .toString()
  )
  return data
}

/**
 * Get the template for a page.
 *
 * @param page The page to get the template for.
 * @returns The template for the page.
 */
const getPageTemplate = (page: string): string => {
  const pageTemplateName = fs.existsSync(
    path.resolve(__dirname, 'src', 'templates', `${page}.html`)
  )
    ? page
    : 'index'
  const templateHtml = fs
    .readFileSync(
      path.resolve(__dirname, 'src', 'templates', `${pageTemplateName}.html`),
      'utf-8'
    )
    .toString()
  return templateHtml
}

/**
 * Get header template.
 */
const getHeaderTemplate = (): string => {
  const headerHtml = fs
    .readFileSync(path.resolve(__dirname, 'src', 'templates', 'header.html'))
    .toString()
  return headerHtml
}

/**
 * Get footer template.
 */
const getFooterTemplate = (): string => {
  const footerHtml = fs
    .readFileSync(path.resolve(__dirname, 'src', 'templates', 'footer.html'))
    .toString()
  return footerHtml
}

/**
 * Get styles.
 */
const getStyles = (): void => {
  const styles = fs.readdirSync(path.resolve(__dirname, 'src', 'styles'))

  styles.forEach((style) => {
    fs.copyFileSync(
      path.resolve(__dirname, 'src', 'styles', style),
      path.resolve(__dirname, 'dist', 'public', 'styles', style)
    )
  })
}

// Run the script.
clearDist()
getPages()
getStyles()
getPosts()
