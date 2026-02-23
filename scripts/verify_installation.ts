/**
 * Script de Verificación Post-Instalación
 * Ejecutar después de instalar supabase/triggers.sql
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const verify = async () => {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ No se encontró DATABASE_URL o DIRECT_URL');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔍 VERIFICACIÓN POST-INSTALACIÓN DE TRIGGERS\n');
    console.log('═══════════════════════════════════════════════════\n');

    let allPassed = true;

    // 1. Verificar función handle_new_auth_user
    console.log('📋 1. Verificando handle_new_auth_user()...');
    const authUserFunc = await sql`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'handle_new_auth_user'
      ) as exists;
    `;
    
    if (authUserFunc[0].exists) {
      console.log('   ✅ Función handle_new_auth_user() existe\n');
    } else {
      console.log('   ❌ Función handle_new_auth_user() NO existe\n');
      allPassed = false;
    }

    // 2. Verificar función handle_updated_at
    console.log('📋 2. Verificando handle_updated_at()...');
    const updatedAtFunc = await sql`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'handle_updated_at'
      ) as exists;
    `;
    
    if (updatedAtFunc[0].exists) {
      console.log('   ✅ Función handle_updated_at() existe\n');
    } else {
      console.log('   ❌ Función handle_updated_at() NO existe\n');
      allPassed = false;
    }

    // 3. Verificar función handle_delete_auth_user
    console.log('📋 3. Verificando handle_delete_auth_user()...');
    const deleteFunc = await sql`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'handle_delete_auth_user'
      ) as exists;
    `;
    
    if (deleteFunc[0].exists) {
      console.log('   ✅ Función handle_delete_auth_user() existe\n');
    } else {
      console.log('   ❌ Función handle_delete_auth_user() NO existe\n');
      allPassed = false;
    }

    // 4. Verificar función user_organizations
    console.log('📋 4. Verificando user_organizations()...');
    const userOrgsFunc = await sql`
      SELECT EXISTS (
        SELECT FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'user_organizations'
      ) as exists;
    `;
    
    if (userOrgsFunc[0].exists) {
      console.log('   ✅ Función user_organizations() existe\n');
    } else {
      console.log('   ❌ Función user_organizations() NO existe\n');
      allPassed = false;
    }

    // 5. Verificar trigger on_auth_user_created
    console.log('📋 5. Verificando trigger on_auth_user_created...');
    const authCreatedTrigger = await sql`
      SELECT EXISTS (
        SELECT FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'auth'
        AND c.relname = 'users'
        AND t.tgname = 'on_auth_user_created'
      ) as exists;
    `;
    
    if (authCreatedTrigger[0].exists) {
      console.log('   ✅ Trigger on_auth_user_created existe\n');
    } else {
      console.log('   ❌ Trigger on_auth_user_created NO existe\n');
      allPassed = false;
    }

    // 6. Verificar trigger on_auth_user_deleted
    console.log('📋 6. Verificando trigger on_auth_user_deleted...');
    const authDeletedTrigger = await sql`
      SELECT EXISTS (
        SELECT FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'auth'
        AND c.relname = 'users'
        AND t.tgname = 'on_auth_user_deleted'
      ) as exists;
    `;
    
    if (authDeletedTrigger[0].exists) {
      console.log('   ✅ Trigger on_auth_user_deleted existe\n');
    } else {
      console.log('   ❌ Trigger on_auth_user_deleted NO existe\n');
      allPassed = false;
    }

    // 7. Verificar triggers set_updated_at en tablas principales
    console.log('📋 7. Verificando triggers set_updated_at...');
    const tables = ['users', 'organizations', 'voice_agents', 'phone_numbers', 'departments', 'calendar_schedules', 'appointments'];
    let updatedAtTriggersCount = 0;
    
    for (const table of tables) {
      const triggerExists = await sql`
        SELECT EXISTS (
          SELECT FROM pg_trigger t
          JOIN pg_class c ON t.tgrelid = c.oid
          JOIN pg_namespace n ON c.relnamespace = n.oid
          WHERE n.nspname = 'public'
          AND c.relname = ${table}
          AND t.tgname = 'set_updated_at'
        ) as exists;
      `;
      
      if (triggerExists[0].exists) {
        updatedAtTriggersCount++;
        console.log(`   ✅ Trigger set_updated_at en ${table}`);
      } else {
        console.log(`   ⚠️  Trigger set_updated_at falta en ${table}`);
      }
    }
    console.log('');

    // 8. Verificar que no existen funciones obsoletas
    console.log('📋 8. Verificando ausencia de funciones obsoletas...');
    const obsoleteFuncs = await sql`
      SELECT p.proname
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname IN ('handle_new_user', 'handle_user_delete')
      ORDER BY p.proname;
    `;
    
    if (obsoleteFuncs.length === 0) {
      console.log('   ✅ No hay funciones obsoletas\n');
    } else {
      console.log('   ⚠️  Funciones obsoletas detectadas:');
      obsoleteFuncs.forEach(f => console.log(`      - ${f.proname}()`));
      console.log('   💡 Ejecutar: bun run db:cleanup\n');
    }

    // 9. Verificar integridad de datos
    console.log('📋 9. Verificando integridad de usuarios...');
    const orphanUsers = await sql`
      SELECT COUNT(*) as count
      FROM auth.users au
      LEFT JOIN public.users pu ON au.id = pu.id
      WHERE pu.id IS NULL;
    `;
    
    if (parseInt(orphanUsers[0].count) === 0) {
      console.log('   ✅ No hay usuarios huérfanos\n');
    } else {
      console.log(`   ⚠️  ${orphanUsers[0].count} usuarios huérfanos detectados`);
      console.log('   💡 Ejecutar: bun run db:inspect para recrearlos\n');
      allPassed = false;
    }

    // Resumen final
    console.log('═══════════════════════════════════════════════════');
    
    if (allPassed && updatedAtTriggersCount === tables.length && obsoleteFuncs.length === 0) {
      console.log('🎉 VERIFICACIÓN COMPLETADA EXITOSAMENTE');
      console.log('═══════════════════════════════════════════════════');
      console.log('');
      console.log('✅ Todas las funciones están instaladas');
      console.log('✅ Todos los triggers están configurados');
      console.log('✅ No hay funciones obsoletas');
      console.log('✅ Integridad de datos correcta');
      console.log('');
      console.log('🚀 El sistema está listo para producción');
      
    } else {
      console.log('⚠️  VERIFICACIÓN INCOMPLETA');
      console.log('═══════════════════════════════════════════════════');
      console.log('');
      console.log('Por favor, revisar los ítems marcados con ❌ arriba.');
      console.log('');
      console.log('📚 Consultar documentación:');
      console.log('   • supabase/README.md');
      console.log('   • docs/RESOLUCION_TRIGGER_USUARIOS.md');
      console.log('');
      console.log('🔧 Pasos sugeridos:');
      console.log('   1. Reinstalar: supabase/triggers.sql en SQL Editor');
      console.log('   2. Limpiar obsoletos: bun run db:cleanup');
      console.log('   3. Recrear huérfanos: bun run db:inspect');
      console.log('   4. Verificar de nuevo: bun run db:verify');
    }
    
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error durante verificación:', error);
  } finally {
    await sql.end();
  }
};

verify();
