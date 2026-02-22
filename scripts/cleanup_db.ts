/**
 * Script de limpieza - Elimina funciones y triggers obsoletos
 * Ejecutar después de instalar supabase/triggers.sql
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const cleanup = async () => {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ No se encontró DATABASE_URL o DIRECT_URL');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🧹 LIMPIEZA DE FUNCIONES Y TRIGGERS OBSOLETOS\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Lista de funciones obsoletas a eliminar
    const obsoleteFunctions = [
      'handle_new_user',  // Nombre antiguo, ahora es handle_new_auth_user
      'handle_user_delete', // Si existiera con nombre antiguo
    ];

    let cleanupCount = 0;

    for (const funcName of obsoleteFunctions) {
      try {
        // Verificar si existe
        const exists = await sql`
          SELECT EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = ${funcName}
          ) as exists;
        `;

        if (exists[0].exists) {
          console.log(`🗑️  Eliminando función obsoleta: ${funcName}()`);
          
          // Eliminar función (CASCADE elimina triggers asociados)
          await sql.unsafe(`DROP FUNCTION IF EXISTS public.${funcName} CASCADE;`);
          
          console.log(`   ✅ ${funcName}() eliminada\n`);
          cleanupCount++;
        } else {
          console.log(`   ⏭️  ${funcName}() no existe (skip)\n`);
        }
      } catch (error: any) {
        console.error(`   ❌ Error eliminando ${funcName}():`, error.message);
      }
    }

    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 RESUMEN: ${cleanupCount} funciones obsoletas eliminadas`);
    console.log('═══════════════════════════════════════════════════\n');

    // Verificar estado final
    console.log('🔍 Verificando funciones activas relacionadas con auth...\n');
    
    const activeFunctions = await sql`
      SELECT 
        p.proname as name,
        pg_get_function_identity_arguments(p.oid) as args
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND (p.proname LIKE '%user%' OR p.proname LIKE '%auth%')
      ORDER BY p.proname;
    `;

    console.log('✅ Funciones activas:');
    activeFunctions.forEach((f) => {
      const signature = f.args ? `${f.name}(${f.args})` : `${f.name}()`;
      console.log(`   • ${signature}`);
    });

    console.log('\n✅ Limpieza completada. Ejecuta diagnóstico para verificar:');
    console.log('   bun run scripts/diagnose_db.ts\n');

  } catch (error) {
    console.error('❌ Error durante limpieza:', error);
  } finally {
    await sql.end();
  }
};

cleanup();
