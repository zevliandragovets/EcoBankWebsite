// prisma/prisma.config.ts
import { defineConfig } from 'prisma/config'

export default defineConfig({
  seed: 'tsx prisma/seed.ts'
})
