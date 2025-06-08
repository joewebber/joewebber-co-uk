import http from 'http'
import path from 'path'
import mime from 'mime'
import fs from 'fs'
import { WebSocketServer } from 'ws'
import chokidar from 'chokidar'
import { execSync } from 'child_process'

const PATHS = [path.resolve('./src'), path.resolve('./data')]
const WEB_ROOT = path.resolve('./dist/public')

const PORT = 8080
const WS_PORT = 8081

const assetsServer = http.createServer(async (request, response) => {
  // Reject non-GET methods.
  if (request.method !== 'GET') {
    const responseBody = `Forbidden Method: ${request.method}`

    response.writeHead(403, {
      'Content-Type': 'plain/text',
      'Content-Length': Buffer.byteLength(responseBody),
    })

    return response.end(responseBody)
  }

  // GET '/client.js'
  if (request.url === '/client.js') {
    const responseBody = await fs.promises.readFile('./client.js')

    response.writeHead(200, {
      'Content-Length': responseBody.length,
      'Content-Type': 'application/javascript',
    })

    return response.end(responseBody)
  }

  // Parse the request URL to get the resource pathname.
  const url = new URL(request.url, `http://${request.headers.host}`)
  let pathname = url.pathname

  // If the pathname ends with '/', append 'index.html'.
  if (pathname.endsWith('/')) {
    pathname += 'index.html'
  } else {
    // If the pathname does not have an extension, append '.html'.
    const ext = path.extname(pathname)
    if (!ext) {
      pathname += '.html'
    }
  }

  try {
    // Try to read the given resource into a Buffer.
    const resourcePath = path.join(WEB_ROOT, pathname)
    let responseBody = await fs.promises.readFile(resourcePath)

    // HTML Files: Inject a <script> tag before </body>
    if (resourcePath.endsWith('.html')) {
      responseBody = responseBody
        .toString()
        .replace('</body>', '<script src="client.js"></script></body>')

      responseBody = Buffer.from(responseBody)
    }

    response.writeHead(200, {
      'Content-Type': mime.getType(resourcePath),
      'Content-Length': responseBody.length,
    })

    return response.end(responseBody)
  } catch (e) {
    // Respond to all errors with a 404 response.
    const responseBody = `Cannot GET resource: ${pathname}`

    response.writeHead(404, {
      'Content-Type': 'plain/text',
      'Content-Length': Buffer.byteLength(responseBody),
    })

    return response.end(responseBody)
  }
})

// Start the HTTP server.
assetsServer.listen(PORT, () => {
  console.log(`Assets Server is running on port: ${PORT}`)
})

// WebSocket Server for live-reloading.
const reloadServer = new WebSocketServer({
  port: WS_PORT,
})

reloadServer.on('listening', () => {
  console.log(`WebSocket Server is running on port: ${WS_PORT}`)
})

reloadServer.on('reload', () => {
  reloadServer.clients.forEach((client) => {
    client.send('RELOAD')
  })
})

// Watch for changes in the ROOT directory.
chokidar.watch(PATHS).on('all', (event, path) => {
  if (event === 'change') {
    console.info(`Detected change in ${path}. Reloading...`)
    execSync('npm run build')
    reloadServer.emit('reload')
  }
})
