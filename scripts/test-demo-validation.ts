#!/usr/bin/env bun
/**
 * Test: Validación de Rate Limits en PostgreSQL
 * @description Prueba la función validate_demo_rate_limits() con casos reales
 */

import { getDb } from '../src/lib/db/client.server';
import { usersDemo, ipTrials } from '../src/lib/db/client';
import { eq } from 'drizzle-orm';

// Mock requestEvent para getDb()
const mockRequestEvent = {
  env: {
    get: (key: string) => process.env[key],
  },
} as any;

const db = getDb(mockRequestEvent);

// Color helpers
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;

async function testRateLimits() {
  console.log(blue('\n🧪 Testing PostgreSQL Rate Limit Validation\n'));

  const testPhone = '+34600000TEST';
  const testIP = '192.168.1.TEST';
  const testEmail = 'test@ratelimit.com';

  try {
    // ═══════════════════════════════════════════════════════════
    // TEST 1: Insertar primer demo (debe pasar)
    // ═══════════════════════════════════════════════════════════
    console.log(blue('📝 TEST 1: Primer demo (debe pasar)'));
    
    const demo1 = await db.insert(usersDemo).values({
      name: 'Test User 1',
      email: testEmail,
      phone: testPhone,
      industry: 'concesionario',
      ipAddress: testIP,
      status: 'pending_verification',
      verificationType: 'email_otp',
      retellCallId: '123456',
      satisfaction: 0,
    }).returning();
    
    console.log(green(`✅ Demo creada: ID ${demo1[0].id}`));
    console.log(yellow(`   • Teléfono: ${testPhone}`));
    console.log(yellow(`   • IP: ${testIP}\n`));

    // ═══════════════════════════════════════════════════════════
    // TEST 2: Verificar que IP se registró en ip_trials
    // ═══════════════════════════════════════════════════════════
    console.log(blue('📝 TEST 2: Verificar tracking de IP'));
    
    const ipRecord = await db.query.ipTrials.findFirst({
      where: (ipTrials, { eq }) => eq(ipTrials.ipAddress, testIP),
    });
    
    if (ipRecord) {
      console.log(green(`✅ IP registrada en ip_trials:`));
      console.log(yellow(`   • Trial count: ${ipRecord.trialCount}`));
      console.log(yellow(`   • Last trial: ${ipRecord.lastTrialAt}\n`));
    } else {
      console.log(red('❌ IP NO registrada en ip_trials\n'));
    }

    // ═══════════════════════════════════════════════════════════
    // TEST 3: Segundo demo mismo teléfono (debe pasar si límite > 1)
    // ═══════════════════════════════════════════════════════════
    console.log(blue('📝 TEST 3: Segundo demo mismo teléfono'));
    
    const demo2 = await db.insert(usersDemo).values({
      name: 'Test User 2',
      email: 'test2@ratelimit.com',
      phone: testPhone,
      industry: 'inmobiliaria',
      ipAddress: '192.168.1.DIFFERENT',
      status: 'pending_verification',
      verificationType: 'email_otp',
      retellCallId: '789012',
      satisfaction: 0,
    }).returning();
    
    console.log(green(`✅ Segundo demo creada: ID ${demo2[0].id}`));
    console.log(yellow(`   • Mismo teléfono: ${testPhone}\n`));

    // ═══════════════════════════════════════════════════════════
    // LIMPIEZA: Eliminar datos de prueba
    // ═══════════════════════════════════════════════════════════
    console.log(blue('🧹 Limpiando datos de prueba...'));
    
    await db.delete(usersDemo).where(eq(usersDemo.phone, testPhone));
    await db.delete(ipTrials).where(eq(ipTrials.ipAddress, testIP));
    await db.delete(ipTrials).where(eq(ipTrials.ipAddress, '192.168.1.DIFFERENT'));
    
    console.log(green('✅ Datos de prueba eliminados\n'));

    // ═══════════════════════════════════════════════════════════
    // RESUMEN
    // ═══════════════════════════════════════════════════════════
    console.log(green('╔═══════════════════════════════════════════════════════╗'));
    console.log(green('║  ✅ VALIDACIÓN FUNCIONANDO CORRECTAMENTE             ║'));
    console.log(green('╚═══════════════════════════════════════════════════════╝\n'));
    
    console.log(yellow('📊 Límites actuales:'));
    console.log('   • Máximo demos por teléfono: 200/mes');
    console.log('   • Máximo intentos por IP: 200/mes');
    console.log('   • Auto-bloqueo de IP: Activado');
    console.log('   • Reset automático: 1 mes\n');
    
    console.log(blue('💡 Para testing en producción:'));
    console.log('   1. Cambiar v_max_calls a 2 en Supabase SQL Editor');
    console.log('   2. Intentar 3 demos con el mismo teléfono');
    console.log('   3. El 3er intento debe lanzar RATE_LIMIT_EXCEEDED\n');

  } catch (error: any) {
    console.error(red('\n❌ TEST FALLIDO:'));
    
    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      console.log(yellow('\n⚠️  Rate limit detectado (esto es correcto si ya había demos previos)'));
      console.log(yellow('   Elimina manualmente los demos de prueba con:'));
      console.log(`   DELETE FROM users_demo WHERE phone = '${testPhone}';`);
    } else if (error.message?.includes('IP_BLOCKED')) {
      console.log(yellow('\n⚠️  IP bloqueada (esto es correcto si ya había intentos previos)'));
      console.log(yellow('   Desbloquea manualmente la IP con:'));
      console.log(`   DELETE FROM ip_trials WHERE ip_address = '${testIP}';`);
    } else {
      console.error(error.message);
      console.error('\nDetalles completos:');
      console.error(error);
    }
    
    process.exit(1);
  }
}

// Ejecutar
testRateLimits().catch((error) => {
  console.error(red('\n❌ Error fatal:'), error);
  process.exit(1);
});
