import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

if (!process.env.DIRECT_URL) {
  throw new Error(
    '❌ DIRECT_URL no está definida. Necesaria para ejecutar migraciones.\n' +
    'Asegúrate de que .env.local contiene DIRECT_URL con puerto 5432 (Session Mode).'
  );
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL, // Puerto 5432 - Session Mode
  },
  verbose: true,
  strict: true,
} satisfies Config;
