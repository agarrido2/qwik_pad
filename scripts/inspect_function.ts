/**
 * Script para inspeccionar la definición de las funciones relacionadas con auth
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const inspect = async () => {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ No se encontró DATABASE_URL o DIRECT_URL');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔍 DEFINICIÓN DE handle_new_auth_user():\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    const functionDef = await sql`
      SELECT pg_get_functiondef(p.oid) as definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_auth_user';
    `;
    
    if (functionDef.length > 0) {
      console.log(functionDef[0].definition);
    } else {
      console.log('❌ Función no encontrada');
    }
    
    console.log('\n═══════════════════════════════════════════════════\n');
    
    // Ver también los logs de errores recientes en Supabase
    console.log('🔍 Intentando recrear usuario huérfano manualmente...\n');
    
    const authUser = await sql`
      SELECT id, email, raw_user_meta_data, created_at
      FROM auth.users
      WHERE id = '4da4c9b3-76c9-4a77-85ff-391a313730eb'::uuid;
    `;
    
    if (authUser.length > 0) {
      const user = authUser[0];
      console.log('📋 Datos del usuario en auth.users:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Metadata: ${JSON.stringify(user.raw_user_meta_data, null, 2)}`);
      console.log(`   Creado: ${user.created_at}\n`);
      
      // Intentar insertar manualmente para ver el error
      try {
        console.log('⚠️  Intentando insertar en public.users...\n');
        
        await sql`
          INSERT INTO public.users (
            id, 
            email, 
            full_name, 
            avatar_url,
            role,
            is_active,
            subscription_tier,
            onboarding_completed,
            created_at,
            updated_at
          ) VALUES (
            ${user.id}::uuid,
            ${user.email},
            ${user.raw_user_meta_data?.full_name || user.raw_user_meta_data?.name || null},
            ${user.raw_user_meta_data?.avatar_url || null},
            'invited',
            true,
            'free',
            false,
            ${user.created_at},
            NOW()
          );
        `;
        
        console.log('✅ Usuario creado exitosamente en public.users');
        
      } catch (insertError: any) {
        console.error('❌ Error al insertar:', insertError.message);
        console.error('   Detalles:', insertError);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
};

inspect();
