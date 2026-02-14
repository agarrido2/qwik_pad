#!/usr/bin/env bun
/**
 * Script: Aplicar PostgreSQL Function para Rate Limits
 * @description Ejecuta validate_demo_rate_limits.sql en Supabase
 * 
 * IMPORTANTE: Este script debe ejecutarse UNA VEZ para crear la función y trigger
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// Color helpers
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;

async function applyValidationFunction() {
  console.log(blue('\n🔧 Aplicando PostgreSQL Function para Rate Limits...\n'));

  // 1. Validar DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(red('❌ ERROR: DATABASE_URL no encontrada en .env.local'));
    console.log(yellow('   Asegúrate de tener .env.local con DATABASE_URL configurada'));
    process.exit(1);
  }

  // 2. Convertir a Session Mode (puerto 5432 para schema changes)
  // Supabase usa puerto 6543 para transaction pooler, pero necesitamos 5432 para DDL
  let sessionUrl = databaseUrl;
  if (databaseUrl.includes(':6543/')) {
    sessionUrl = databaseUrl.replace(':6543/', ':5432/');
    console.log(yellow('⚠️  Cambiando a Session Mode (puerto 5432) para DDL operations'));
  }

  // 3. Leer archivo SQL
  const sqlFilePath = join(process.cwd(), 'drizzle/manual/validate_demo_rate_limits.sql');
  let sqlContent: string;
  
  try {
    sqlContent = readFileSync(sqlFilePath, 'utf-8');
    console.log(green(`✓ Archivo SQL leído: ${sqlFilePath}`));
  } catch (error) {
    console.error(red('❌ ERROR: No se pudo leer el archivo SQL'));
    console.error(error);
    process.exit(1);
  }

  // 4. Conectar a PostgreSQL
  console.log(blue('\n📡 Conectando a Supabase...'));
  
  const sql = postgres(sessionUrl, {
    max: 1, // Solo una conexión
    ssl: 'require',
  });

  try {
    // 5. Ejecutar SQL
    console.log(blue('\n⚡ Ejecutando SQL...\n'));
    
    await sql.unsafe(sqlContent);
    
    console.log(green('✅ Function y Trigger creados exitosamente\n'));
    
    // 6. Verificar que se crearon correctamente
    console.log(blue('🔍 Verificando instalación...\n'));
    
    const [funcExists] = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'validate_demo_rate_limits'
      ) as exists
    `;
    
    const [triggerExists] = await sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'validate_demo_before_insert'
      ) as exists
    `;
    
    if (funcExists.exists && triggerExists.exists) {
      console.log(green('✅ FUNCTION validate_demo_rate_limits() → Instalada'));
      console.log(green('✅ TRIGGER validate_demo_before_insert → Activo'));
      console.log(green('\n🎉 ¡Validación de rate limits activada!\n'));
      
      console.log(yellow('📋 Límites actuales:'));
      console.log('   • Teléfono: 200 demos/mes (cambiar a 2 en producción)');
      console.log('   • IP: 200 intentos/mes (auto-bloqueo si excede)');
      console.log('   • Reset automático: 1 mes\n');
      
      console.log(blue('💡 Cambiar límites en producción:'));
      console.log('   Editar directamente en Supabase SQL Editor:');
      console.log('   v_max_calls INTEGER := 200 → v_max_calls INTEGER := 2\n');
    } else {
      console.log(yellow('⚠️  Verificación parcial - revisa manualmente en Supabase Dashboard'));
    }
    
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log(yellow('\n⚠️  La función y/o trigger ya existen.'));
      console.log(yellow('   Puedes eliminarlos primero con:'));
      console.log('   DROP TRIGGER IF EXISTS validate_demo_before_insert ON users_demo;');
      console.log('   DROP FUNCTION IF EXISTS validate_demo_rate_limits();');
      console.log(yellow('\n   O ejecutar este script nuevamente para recrearlos.\n'));
    } else {
      console.error(red('\n❌ ERROR al ejecutar SQL:'));
      console.error(error.message);
      console.error(red('\nDetalles completos:'));
      console.error(error);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

// Ejecutar
applyValidationFunction().catch((error) => {
  console.error(red('\n❌ Error fatal:'), error);
  process.exit(1);
});
