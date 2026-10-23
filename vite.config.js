import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { createSiteServices } from './server/site-services.mjs'

export default defineConfig(({ mode }) => {
  const root = fileURLToPath(new URL('.', import.meta.url))
  const env = { ...loadEnv(mode, root, 'HAKUBA_'), ...process.env }
  return {
    plugins: [react(), {
      name: 'hakuba-local-services',
      configureServer(server) { server.middlewares.use(createSiteServices({ root, env, development: true })) },
      configurePreviewServer(server) { server.middlewares.use(createSiteServices({ root, env, development: true })) },
    }],
    server: { fs: { deny: ['.env', '.env.*', '**/.git/**', '**/.local/**', '**/private/**', '**/legacy*.html', '**/hakuba-wado-complete*.html', '**/output/**', '**/backups/**'] } },
  }
})
