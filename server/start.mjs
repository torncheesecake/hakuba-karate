import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSiteServices } from './site-services.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const dist = resolve(root, 'dist')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' }
const services = createSiteServices({ root })
const server = createServer(async (req, res) => {
  try {
  await services(req, res, async () => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end() }
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      if (pathname.split('/').some((part) => part.startsWith('.'))) throw new Error('Hidden path')
      let file = resolve(dist, '.' + pathname)
      if (file !== dist && !file.startsWith(dist + sep)) throw new Error('Invalid path')
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html')
      if (!types[extname(file)]) throw new Error('Unknown type')
      const content = await readFile(file)
      res.writeHead(200, { 'Content-Type': types[extname(file)], 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' })
      res.end(req.method === 'HEAD' ? undefined : content)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Page not found. Return to / to find your class.')
    }
  })
  } catch {
    if (!res.headersSent) res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
    res.end('Service temporarily unavailable.')
  }
})
server.requestTimeout = 15000
server.headersTimeout = 10000
server.listen(Number(process.env.PORT || 4173), process.env.HOST || '127.0.0.1', () => console.log('Hakuba replacement server ready. No live services are connected by default.'))
