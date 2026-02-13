import { z } from 'zod';

/**
 * Environment Variables Validation (Server-Side Only)
 * 
 * Este archivo valida las variables de entorno críticas en el arranque.
 * Si falta alguna o es inválida, la app falla inmediatamente (Fail Fast).
 * 
 * Basado en: docs/standards/SUPABASE_DRIZZLE_MASTER.md
 */

const envSchema = z.object({
  // Supabase (Públicas - disponibles en cliente)
  PUBLIC_SUPABASE_URL: z
    .string()
    .url('PUBLIC_SUPABASE_URL debe ser una URL válida')
    .startsWith('https://', 'PUBLIC_SUPABASE_URL debe usar HTTPS'),
  
  PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'PUBLIC_SUPABASE_ANON_KEY es obligatoria'),

  // Supabase (Privadas - solo server)
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY es obligatoria'),

  // Base de Datos - VALIDACIÓN ROBUSTA DE PUERTO
  // Puerto 6543 (Transaction Mode) - Para la App
  DATABASE_URL: z
    .string()
    .startsWith('postgres', 'DATABASE_URL debe ser una conexión PostgreSQL')
    .refine(
      (url) => {
        const portMatch = url.match(/:(\d+)\//);
        return portMatch && portMatch[1] === '6543';
      },
      'DATABASE_URL debe usar puerto 6543 (Transaction Pooler)'
    )
    .refine(
      (url) => url.includes('pgbouncer=true'),
      'DATABASE_URL debe incluir parámetro pgbouncer=true para Transaction Mode'
    ),

  // Puerto 5432 (Session Mode) - Para Migraciones
  DIRECT_URL: z
    .string()
    .startsWith('postgres', 'DIRECT_URL debe ser una conexión PostgreSQL')
    .refine(
      (url) => {
        const portMatch = url.match(/:(\d+)\//);
        return portMatch && portMatch[1] === '5432';
      },
      'DIRECT_URL debe usar puerto 5432 (Session Mode para migraciones)'
    ),

  // OAuth Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Resend (Emails transaccionales)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY es obligatoria'),
  RESEND_FROM: z.string().email('RESEND_FROM debe ser un email válido'),

  // Retell AI (Llamadas telefónicas con IA)
  RETELL_API_KEY: z
    .string()
    .min(1, 'RETELL_API_KEY es obligatoria')
    .startsWith('key_', 'RETELL_API_KEY debe empezar con key_'),
  RETELL_FROM_NUMBER: z
    .string()
    .min(1, 'RETELL_FROM_NUMBER es obligatorio')
    .regex(/^\+[1-9]\d{8,14}$/, 'RETELL_FROM_NUMBER debe ser formato E.164 (ej: +34919930992)'),

  // App Config
  PUBLIC_SITE_URL: z.string().url('PUBLIC_SITE_URL debe ser una URL válida'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

// Validar variables de entorno en el arranque
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error(
    '❌ FATAL: Variables de entorno inválidas o faltantes:\n',
    JSON.stringify(parseResult.error.flatten().fieldErrors, null, 2)
  );
  process.exit(1); // Detener ejecución inmediatamente
}

// Exportar variables tipadas y validadas
export const ENV = parseResult.data;

// Helpers de entorno
export const isDev = ENV.NODE_ENV === 'development';
export const isProd = ENV.NODE_ENV === 'production';
export const isTest = ENV.NODE_ENV === 'test';
