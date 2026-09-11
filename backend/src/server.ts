import { app } from './app.ts'
import { env } from './config/env.ts'
import { prisma } from './lib/prisma.ts'

const server = app.listen(env.PORT, () => {
  console.log(`Server berjalan di http://localhost:${env.PORT}`)
})

server.on('error', (error) => {
  console.error('Server gagal berjalan:', error)
  process.exit(1)
})

function shutdown(signal: string) {
  console.log(`${signal} diterima, menutup server...`)
  const forceExit = setTimeout(() => process.exit(1), 10_000)
  forceExit.unref()
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
