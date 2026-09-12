import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const indexHtmlPath = fileURLToPath(new URL('./index.html', import.meta.url))

function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' || !req.headers.accept?.includes('text/html')) {
          return next()
        }
        try {
          const html = readFileSync(indexHtmlPath, 'utf-8')
          const transformed = await server.transformIndexHtml(req.url ?? '/', html)
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/html')
          res.end(transformed)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
    const backendUrl = env.VITE_API_BASE_URL

  return {
    plugins: [vue(), vueJsx(), vueDevTools(), tailwindcss(), spaFallback()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: backendUrl
        ? { '/products': backendUrl, '/uploads': backendUrl, '/health': backendUrl }
        : undefined,
    },
  }
})
