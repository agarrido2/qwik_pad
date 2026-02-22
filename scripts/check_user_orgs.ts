/**
 * Script para verificar organizaciones de un usuario
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const checkUser = async () => {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ No se encontró DATABASE_URL o DIRECT_URL');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔍 VERIFICACIÓN DE USUARIO Y ORGANIZACIONES\n');
    console.log('═══════════════════════════════════════════════════\n');

    // Obtener todos los usuarios
    const allUsers = await sql`
      SELECT 
        id,
        email,
        full_name,
        role,
        is_active,
        onboarding_completed,
        created_at
      FROM public.users
      ORDER BY created_at DESC;
    `;

    console.log('📋 USUARIOS EN public.users:\n');
    allUsers.forEach((u) => {
      console.log(`   ID: ${u.id}`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Nombre: ${u.full_name || '(sin nombre)'}`);
      console.log(`   Role: ${u.role}`);
      console.log(`   Activo: ${u.is_active}`);
      console.log(`   Onboarding completado: ${u.onboarding_completed}`);
      console.log(`   Creado: ${u.created_at}\n`);
    });

    // Para cada usuario, verificar sus organizaciones
    for (const user of allUsers) {
      console.log(`🏢 Organizaciones de ${user.email}:\n`);
      
      const orgs = await sql`
        SELECT 
          o.id as org_id,
          o.name as org_name,
          o.slug as org_slug,
          om.role as member_role,
          om.joined_at
        FROM public.organization_members om
        JOIN public.organizations o ON om.organization_id = o.id
        WHERE om.user_id = ${user.id}::uuid
        ORDER BY om.joined_at DESC;
      `;

      if (orgs.length === 0) {
        console.log('   ⚠️  Sin organizaciones (problema detectado)\n');
      } else {
        orgs.forEach((org) => {
          console.log(`   ✅ ${org.org_name} (${org.org_slug})`);
          console.log(`      Role: ${org.member_role}`);
          console.log(`      Unido: ${org.joined_at}\n`);
        });
      }
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('🎯 ANÁLISIS:\n');

    const userWithoutOrgs = allUsers.filter(async (user) => {
      const orgs = await sql`
        SELECT COUNT(*) as count
        FROM public.organization_members
        WHERE user_id = ${user.id}::uuid;
      `;
      return parseInt(orgs[0].count) === 0;
    });

    if (allUsers.length > 0) {
      const totalUsers = allUsers.length;
      console.log(`   Total usuarios: ${totalUsers}`);
      
      for (const user of allUsers) {
        const orgCount = await sql`
          SELECT COUNT(*) as count
          FROM public.organization_members
          WHERE user_id = ${user.id}::uuid;
        `;
        
        const count = parseInt(orgCount[0].count);
        
        if (count === 0) {
          console.log(`   ⚠️  ${user.email}: 0 organizaciones (debe completar onboarding)`);
        } else {
          console.log(`   ✅ ${user.email}: ${count} organización(es)`);
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
};

checkUser();
