import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

// Load environment variables from .dev.vars (Wrangler's env file)
dotenv.config({ path: '.dev.vars' })

export function getLocalD1DB() {
  try {
    // Use the D1 state database that wrangler dev uses
    const statePath = path.resolve(
      '.wrangler/state/v3/d1/miniflare-D1DatabaseObject'
    )

    // Ensure state directory exists
    if (!fs.existsSync(statePath)) {
      fs.mkdirSync(statePath, { recursive: true })
    }

    // Look for existing SQLite file in state directory
    const dbFile = fs
      .readdirSync(statePath, { encoding: 'utf-8' })
      .find(f => f.endsWith('.sqlite'))

    if (dbFile) {
      const dbPath = path.resolve(statePath, dbFile)
      console.log(`Using D1 state database: ${dbPath}`)
      return dbPath
    }

    // If no SQLite file exists, check the wrangler config for database ID
    // and create the expected filename
    const configPath = path.resolve('wrangler.jsonc')
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      const dbId = config.d1_databases?.[0]?.database_id
      if (dbId) {
        // Create hash-based filename that matches wrangler's pattern
        const hash = crypto.createHash('sha256').update(dbId).digest('hex')
        const dbPath = path.resolve(statePath, `${hash}.sqlite`)
        console.log(`Using expected D1 state database path: ${dbPath}`)
        return dbPath
      }
    }

    // Fallback to a default path in state directory
    const defaultDbPath = path.resolve(statePath, 'database.sqlite')
    console.log(`Using fallback D1 state database: ${defaultDbPath}`)
    return defaultDbPath
  } catch (e) {
    console.error(`Error finding D1 database: ${e}`)
    // Final fallback
    return path.resolve(
      '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/database.sqlite'
    )
  }
}

export default defineConfig({
  dialect: 'sqlite',
  schema: ['./worker/db/*', 'auth-schema.ts'],
  out: './drizzle',
  ...(process.env.NODE_ENV === 'production'
    ? {
        driver: 'd1-http',
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
          databaseId: process.env.CLOUDFLARE_DATABASE_ID,
          token: process.env.CLOUDFLARE_D1_TOKEN,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB(),
        },
      }),
})
