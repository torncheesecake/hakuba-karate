import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const stage = join(root, '.local/wordpress-package')
const output = join(root, 'output/wordpress-build')
const allowedSource = new Set(['php', 'md', 'js', 'css', 'json'])

function copyTree(source, target, extensions) {
  mkdirSync(target, { recursive: true })
  for (const name of readdirSync(source)) {
    const from = join(source, name), to = join(target, name), stat = lstatSync(from)
    if (stat.isSymbolicLink()) throw new Error(`Symlink is not a distributable asset: ${relative(root, from)}`)
    if (name.startsWith('.')) continue
    if (relative(root, from) === 'public/images/video-stills/manifest.json') continue
    if (stat.isDirectory()) copyTree(from, to, extensions)
    else if (extensions.has(name.split('.').pop().toLowerCase())) cpSync(from, to)
    else throw new Error(`Unexpected file in distribution source: ${relative(root, from)}`)
  }
}

// Start clean so deleted source files cannot survive a later package build.
const { rmSync } = await import('node:fs')
rmSync(stage, { recursive: true, force: true })
mkdirSync(output, { recursive: true })
for (const name of ['hakuba-theme', 'hakuba-club']) copyTree(join(root, 'wordpress', name), join(stage, name), allowedSource)
const assets = join(stage, 'hakuba-theme/assets')
for (const [directory, types] of [['images', ['jpg', 'jpeg', 'png', 'webp', 'gif']], ['fonts', ['woff2', 'txt']], ['resources', ['pdf']]]) {
  copyTree(join(root, 'public', directory), join(assets, directory), new Set(types))
}
for (const logo of ['hakuba-logo.png', 'bwf-logo.jpg', 'iwf-logo.png', 'ewf-logo.png']) {
  const source = join(root, 'public', logo)
  if (existsSync(source)) cpSync(source, join(assets, logo))
}
if (!existsSync(join(assets, 'hakuba-logo.png'))) throw new Error('Club logo missing')
mkdirSync(join(assets, 'css'), { recursive: true })
const css = readFileSync(join(root, 'src/styles/site.css'), 'utf8')
  .replaceAll("url('/", "url('../").replaceAll('url("/', 'url("../')
  .replace(/url\((['"]?)(\.\.\/[^'"\)]+)\1\)/g, (match, quote, assetPath) => {
    const file = resolve(assets, 'css', assetPath)
    if (!file.startsWith(assets + '/') || !existsSync(file)) throw new Error('Missing or invalid stylesheet asset: ' + assetPath)
    const version = String(Math.floor(lstatSync(file).mtimeMs / 1000))
    return 'url(' + quote + assetPath + '?hakuba_v=' + version + quote + ')'
  })
writeFileSync(join(assets, 'css/site.css'), css)
for (const name of ['hakuba-theme', 'hakuba-club']) {
  const zip = join(output, `${name}.zip`)
  rmSync(zip, { force: true })
  execFileSync('/usr/bin/zip', ['-q', '-r', zip, name], { cwd: stage })
}
console.log('Built native WordPress theme and content-plugin ZIPs in output/wordpress-build. No private app, Node service, React bundle or credentials included.')
