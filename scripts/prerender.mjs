import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { createServer } from 'vite'
import { publicRoutes, siteUrl } from '../src/data/seo.js'

const dist = resolve('dist')
const template = await readFile(join(dist, 'index.html'), 'utf8')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
try {
  const { renderPage } = await server.ssrLoadModule('/src/prerender.jsx')
  for (const route of publicRoutes) {
    const { html, metadata } = renderPage(route)
    if (!metadata) throw new Error(`Missing metadata for ${route}`)
    const social = Object.entries(metadata.social).map(([property, content]) => `<meta ${property.startsWith('twitter:') ? 'name' : 'property'}="${escape(property)}" content="${escape(content)}">`).join('\n')
    const head = `<title>${escape(metadata.title)}</title>\n<meta name="description" content="${escape(metadata.description)}">\n<meta name="robots" content="${metadata.robots}">\n<link rel="canonical" href="${escape(metadata.url)}">\n${social}\n<script id="club-schema" type="application/ld+json">${JSON.stringify(metadata.schema).replace(/</g, '\\u003c')}</script>`
    const document = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('</head>', `${head}\n</head>`).replace('<div id="root"></div>', `<div id="root" data-page-path="${route}">${html}</div>`)
    const directory = join(dist, route)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'index.html'), document)
  }
  await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicRoutes.map((route) => `<url><loc>${siteUrl}${route === '/' ? '/' : route + '/'}</loc></url>`).join('')}</urlset>\n`)
  await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`)
  // Keep the local admin preview out of indexes even before its JavaScript runs.
  await mkdir(join(dist, 'admin'), { recursive: true })
  await writeFile(join(dist, 'admin/index.html'), template.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>'))
  console.log(`Pre-rendered ${publicRoutes.length} public routes with page metadata.`)
} finally {
  await server.close()
}
