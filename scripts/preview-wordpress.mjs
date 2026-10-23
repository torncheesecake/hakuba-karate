import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

// Reuse the disposable local installation; never install or reconfigure WordPress.
const runtime = '/private/tmp/hakuba-wp-runtime'
const root = `${runtime}/wordpress`
const router = `${runtime}/router.php`
if (!existsSync(`${root}/wp-load.php`) || !existsSync(router)) {
  console.error('The disposable WordPress runtime is missing. Restore it before starting the preview; no live site has been contacted.')
  process.exit(1)
}
console.log('Local WordPress preview: http://localhost:4185/ (leave this process running)')
const child = spawn('php', ['-S', '127.0.0.1:4185', '-t', root, router], { stdio: 'inherit' })
child.on('error', (error) => { console.error(error.message); process.exitCode = 1 })
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0) })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
