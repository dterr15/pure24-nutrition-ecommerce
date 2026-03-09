#!/usr/bin/env node

/**
 * Setup Webhook Script
 * Verifica que todo esté configurado correctamente para webhooks y emails
 *
 * Uso:
 * npm run setup:webhook
 */

import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'error';
  message: string;
}

const results: CheckResult[] = [];

// ============== CHECKS ==============

function checkFile(filePath: string, description: string): void {
  try {
    if (fs.existsSync(filePath)) {
      results.push({
        name: description,
        status: 'pass',
        message: `✅ ${path.basename(filePath)} existe`,
      });
    } else {
      results.push({
        name: description,
        status: 'error',
        message: `❌ No encontrado: ${filePath}`,
      });
    }
  } catch (error) {
    results.push({
      name: description,
      status: 'error',
      message: `❌ Error verificando ${path.basename(filePath)}: ${error}`,
    });
  }
}

function checkEnvVar(varName: string, required: boolean = false): void {
  const value = process.env[varName];

  if (value) {
    results.push({
      name: `Env: ${varName}`,
      status: 'pass',
      message: `✅ ${varName} configurado`,
    });
  } else if (required) {
    results.push({
      name: `Env: ${varName}`,
      status: 'error',
      message: `❌ ${varName} no configurado (requerido)`,
    });
  } else {
    results.push({
      name: `Env: ${varName}`,
      status: 'warn',
      message: `⚠️  ${varName} no configurado (opcional)`,
    });
  }
}

function checkPackage(packageName: string, required: boolean = false): void {
  try {
    require.resolve(packageName);
    results.push({
      name: `Package: ${packageName}`,
      status: 'pass',
      message: `✅ ${packageName} instalado`,
    });
  } catch {
    if (required) {
      results.push({
        name: `Package: ${packageName}`,
        status: 'error',
        message: `❌ ${packageName} no está instalado`,
      });
    } else {
      results.push({
        name: `Package: ${packageName}`,
        status: 'warn',
        message: `⚠️  ${packageName} no instalado (opcional)`,
      });
    }
  }
}

// ============== MAIN ==============

async function main(): Promise<void> {
  console.log('\n🔍 Verificando configuración de webhooks y email...\n');

  // Archivos
  console.log('📁 Archivos:');
  checkFile('./backend/services/email.service.ts', 'Email service');
  checkFile('./backend/webhooks/mercadopago.webhook.ts', 'Webhook handler');
  checkFile('./backend/server.ts', 'Server integración');
  checkFile('./.env.local', 'Variables de entorno');
  checkFile('./.env.example', 'Plantilla de entorno');

  // Variables de entorno
  console.log('\n🔐 Variables de entorno:');
  checkEnvVar('MERCADOPAGO_ACCESS_TOKEN', true);
  checkEnvVar('PAYLOAD_SECRET', true);
  checkEnvVar('EMAIL_PROVIDER', false);
  checkEnvVar('EMAIL_FROM', false);

  // Según el provider de email
  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
  console.log(`\n📧 Email Provider: ${emailProvider}`);

  if (emailProvider === 'smtp') {
    checkEnvVar('SMTP_HOST', true);
    checkEnvVar('SMTP_PORT', true);
    checkEnvVar('SMTP_USER', true);
    checkEnvVar('SMTP_PASSWORD', true);
  } else if (emailProvider === 'sendgrid') {
    checkEnvVar('SENDGRID_API_KEY', true);
  } else if (emailProvider === 'resend') {
    checkEnvVar('RESEND_API_KEY', true);
  }

  // Paquetes necesarios
  console.log('\n📦 Paquetes:');
  checkPackage('nodemailer', false);
  checkPackage('@sendgrid/mail', false);
  checkPackage('resend', false);

  // Mostrar resultados
  console.log('\n' + '='.repeat(60));
  console.log('RESULTADOS:\n');

  let passes = 0;
  let warns = 0;
  let errors = 0;

  for (const result of results) {
    console.log(result.message);
    if (result.status === 'pass') passes++;
    else if (result.status === 'warn') warns++;
    else errors++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ ${passes} OK`);
  console.log(`   ⚠️  ${warns} Advertencias`);
  console.log(`   ❌ ${errors} Errores\n`);

  // Recomendaciones
  if (errors > 0) {
    console.log('🚨 Acciones requeridas:');
    for (const result of results) {
      if (result.status === 'error') {
        console.log(`   → ${result.message}`);
      }
    }
    console.log('');
  }

  if (warns > 0) {
    console.log('📌 Opcionales (para desarrollo completo):');
    for (const result of results) {
      if (result.status === 'warn') {
        console.log(`   → ${result.message}`);
      }
    }
    console.log('');
  }

  // Status final
  console.log('━'.repeat(60));

  if (errors > 0) {
    console.log('\n❌ Configuración incompleta. Revisar errores arriba.\n');
    process.exit(1);
  } else if (warns > 0) {
    console.log(
      '\n⚠️  Configuración básica OK. Algunos componentes opcionales faltantes.\n'
    );
    process.exit(0);
  } else {
    console.log('\n✅ ¡Configuración completa! Webhooks listos.\n');
    console.log('Próximos pasos:');
    console.log('1. npm run dev:backend     → Iniciar servidor con webhooks');
    console.log('2. npm run test:webhook    → Simular webhook de test');
    console.log('3. Revisar logs para verificar email\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
