import * as fs from 'fs'
import * as path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

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
      pageHtml = pageHtml.replace(`{{${key}}}`, data[key])
    })

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
 * Get the data for a page.
 *
 * @param page The page to get the data for.
 * @returns The data for the page.
 */
const getPageData = (page: string): { [key: string]: any } => {
  const data = JSON.parse(
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
