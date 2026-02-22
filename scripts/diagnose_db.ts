/**
 * Script de Diagnóstico - Verifica estado de la base de datos
 * Identifica problemas con triggers, funciones y enums de Supabase
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const diagnose = async () => {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ No se encontró DATABASE_URL o DIRECT_URL');
    process.exit(1);
  }

  console.log('🔍 Conectando a base de datos...\n');
  const sql = postgres(connectionString, { max: 1 });

  try {
    // 1. Verificar tabla public.users
    console.log('📋 TABLA: public.users');
    const usersTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists;
    `;
    console.log(`   ${usersTable[0].exists ? '✅' : '❌'} Tabla 'users' existe: ${usersTable[0].exists}`);

    if (usersTable[0].exists) {
      const userCount = await sql`SELECT COUNT(*) FROM public.users;`;
      console.log(`   📊 Registros en public.users: ${userCount[0].count}\n`);
    } else {
      console.log('   ⚠️  La tabla users NO existe. Ejecuta: bun run db:push\n');
    }

    // 2. Verificar auth.users
    console.log('🔐 TABLA: auth.users');
    const authUsers = await sql`SELECT COUNT(*) FROM auth.users;`;
    console.log(`   📊 Registros en auth.users: ${authUsers[0].count}\n`);

    // 3. Verificar funciones relacionadas con auth
    console.log('⚙️  FUNCIONES:');
    const functions = await sql`
      SELECT 
        p.proname as name,
        pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname LIKE '%user%'
      OR p.proname LIKE '%auth%'
      ORDER BY p.proname;
    `;
    
    if (functions.length === 0) {
      console.log('   ⚠️  No hay funciones relacionadas con usuarios/auth\n');
    } else {
      functions.forEach((f) => {
        console.log(`   ✅ ${f.name}`);
      });
      console.log('');
    }

    // 4. Verificar triggers en auth.users
    console.log('🔔 TRIGGERS en auth.users:');
    const triggers = await sql`
      SELECT 
        tgname as trigger_name,
        tgtype,
        proname as function_name
      FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      JOIN pg_proc p ON t.tgfoid = p.oid
      WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND tgname LIKE '%auth%' OR tgname LIKE '%user%'
      ORDER BY tgname;
    `;
    
    if (triggers.length === 0) {
      console.log('   ❌ No hay triggers configurados en auth.users');
      console.log('   ⚠️  PROBLEMA IDENTIFICADO: El trigger para crear public.users está ausente\n');
    } else {
      triggers.forEach((t) => {
        console.log(`   ✅ ${t.trigger_name} → ${t.function_name}()`);
      });
      console.log('');
    }

    // 5. Verificar enums
    console.log('📐 ENUMS:');
    const enums = await sql`
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    
    if (enums.length === 0) {
      console.log('   ⚠️  No hay enums definidos. Ejecuta: bun run db:push\n');
    } else {
      enums.forEach((e) => {
        console.log(`   ✅ ${e.enum_name}: [${e.values.join(', ')}]`);
      });
      console.log('');
    }

    // 6. Verificar usuarios huérfanos (en auth pero no en public)
    if (usersTable[0].exists) {
      console.log('🔍 VERIFICACIÓN DE INTEGRIDAD:');
      const orphanUsers = await sql`
        SELECT 
          au.id,
          au.email,
          au.created_at
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL
        ORDER BY au.created_at DESC
        LIMIT 5;
      `;
      
      if (orphanUsers.length > 0) {
        console.log(`   ❌ ${orphanUsers.length} usuarios huérfanos detectados (en auth.users pero no en public.users):`);
        orphanUsers.forEach((u) => {
          console.log(`      - ${u.email} (${u.id}) creado ${u.created_at}`);
        });
        console.log('\n   💡 Estos usuarios se crearán automáticamente si instalas el trigger\n');
      } else {
        console.log('   ✅ Todos los usuarios de auth.users tienen registro en public.users\n');
      }
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('📊 RESUMEN:');
    console.log(`   Auth users: ${authUsers[0].count}`);
    console.log(`   Public users: ${usersTable[0].exists ? (await sql`SELECT COUNT(*) FROM public.users`)[0].count : '0 (tabla no existe)'}`);
    console.log(`   Funciones: ${functions.length}`);
    console.log(`   Triggers: ${triggers.length}`);
    console.log(`   Enums: ${enums.length}`);
    console.log('═══════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error durante diagnóstico:', error);
  } finally {
    await sql.end();
  }
};

diagnose();
