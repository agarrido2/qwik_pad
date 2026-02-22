/**
 * Script de verificación y limpieza de base de datos
 * Verifica si hay datos y los elimina respetando foreign keys
 */

import { db } from '../src/lib/db/client';
import {
  users,
  organizations,
  organizationMembers,
  departments,
  callFlowTemplates,
  usersDemo,
  ipTrials,
  voiceAgents,
  phoneNumbers,
  pendingInvitations,
} from '../src/lib/db/schema';
import { sql } from 'drizzle-orm';

async function verifyAndCleanDatabase() {
  console.log('🔍 Verificando estado de la base de datos...\n');

  const tables = [
    { name: 'pending_invitations', table: pendingInvitations },
    { name: 'phone_numbers', table: phoneNumbers },
    { name: 'voice_agents', table: voiceAgents },
    { name: 'ip_trials', table: ipTrials },
    { name: 'users_demo', table: usersDemo },
    { name: 'call_flow_templates', table: callFlowTemplates },
    { name: 'departments', table: departments },
    { name: 'organization_members', table: organizationMembers },
    { name: 'organizations', table: organizations },
    { name: 'users', table: users },
  ];

  const counts: Record<string, number> = {};
  let totalRecords = 0;

  // Verificar cada tabla
  for (const { name, table } of tables) {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(table);
    const count = result[0]?.count ?? 0;
    counts[name] = count;
    totalRecords += count;
    
    if (count > 0) {
      console.log(`  📊 ${name}: ${count} registro(s)`);
    }
  }

  console.log(`\n📈 Total de registros encontrados: ${totalRecords}\n`);

  if (totalRecords === 0) {
    console.log('✅ La base de datos está vacía. No hay nada que limpiar.');
    return;
  }

  console.log('🧹 Procediendo a limpiar la base de datos...\n');

  // Eliminar datos respetando el orden de foreign keys (de hijos a padres)
  for (const { name, table } of tables) {
    if (counts[name] > 0) {
      await db.delete(table);
      console.log(`  ✓ ${name}: ${counts[name]} registro(s) eliminado(s)`);
    }
  }

  console.log('\n✅ Base de datos limpiada correctamente.');
  console.log('✨ Todas las tablas están ahora vacías (0 registros).\n');
}

// Ejecutar
verifyAndCleanDatabase()
  .then(() => {
    console.log('🎉 Proceso completado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  });
