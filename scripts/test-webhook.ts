#!/usr/bin/env node

/**
 * Test Webhook Script
 * Simula webhooks de Mercado Pago para testing local
 *
 * Uso:
 * npm run test:webhook -- --order-number ORD-1234 --status approved
 * npm run test:webhook -- --order-number ORD-5678 --status rejected
 */

import https from 'https';
import http from 'http';
import type { ClientRequestArgs } from 'http';

interface WebhookTestOptions {
  orderNumber: string;
  status: 'approved' | 'rejected' | 'pending' | 'cancelled' | 'refunded';
  paymentId?: number;
  port?: number;
  host?: string;
  secure?: boolean;
}

// Parsear argumentos CLI
function parseArgs(): WebhookTestOptions {
  const args = process.argv.slice(2);
  const options: WebhookTestOptions = {
    orderNumber: 'ORD-' + Date.now(),
    status: 'approved',
    paymentId: Math.floor(Math.random() * 999999999),
    port: 3000,
    host: 'localhost',
    secure: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--order-number' && args[i + 1]) {
      options.orderNumber = args[++i];
    } else if (args[i] === '--status' && args[i + 1]) {
      options.status = args[++i] as any;
    } else if (args[i] === '--port' && args[i + 1]) {
      options.port = parseInt(args[++i]);
    } else if (args[i] === '--host' && args[i + 1]) {
      options.host = args[++i];
    } else if (args[i] === '--secure') {
      options.secure = true;
    }
  }

  return options;
}

// Mapear estado a tipo de evento Mercado Pago
function getEventPayload(
  orderNumber: string,
  status: string,
  paymentId: number
): string {
  const statusMap: { [key: string]: string } = {
    approved: 'approved',
    rejected: 'rejected',
    pending: 'pending',
    cancelled: 'cancelled',
    refunded: 'refunded',
  };

  return JSON.stringify({
    action: 'payment.updated',
    type: 'payment',
    data: {
      id: paymentId,
    },
    // Nota: El webhook real obtendría estos datos de Mercado Pago API
    // Pero para testing local, incluimos la información
    test_data: {
      external_reference: orderNumber,
      status: statusMap[status] || 'approved',
      status_detail: getStatusDetail(status),
    },
  });
}

function getStatusDetail(status: string): string {
  const details: { [key: string]: string } = {
    approved: 'accredited',
    rejected: 'insufficient_funds',
    pending: 'pending_contingency',
    cancelled: 'by_collector',
    refunded: 'by_admin',
  };

  return details[status] || 'accredited';
}

// Enviar webhook
async function sendWebhook(options: WebhookTestOptions): Promise<void> {
  const protocol = options.secure ? https : http;

  const payload = getEventPayload(options.orderNumber, options.status, options.paymentId!);

  const requestOptions: ClientRequestArgs = {
    hostname: options.host,
    port: options.port,
    path: '/api/webhooks/mercadopago',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'User-Agent': 'MercadoPago-Webhook-Test/1.0',
    },
  };

  return new Promise((resolve, reject) => {
    const req = protocol.request(requestOptions, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('\n✅ Webhook enviado exitosamente!\n');
        console.log('📊 Response:');
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        console.log('Body:', responseData ? JSON.stringify(JSON.parse(responseData), null, 2) : '(empty)');

        console.log('\n🔍 Verificar:');
        console.log(
          `1. Orden ${options.orderNumber} debe estar en estado: ${getStatusDetail(options.status)}`
        );
        console.log('2. Email debe haber sido enviado (revisar consola o MailHog)');
        console.log('3. Revisar logs del servidor para más detalles\n');

        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Error enviando webhook:', err.message);
      reject(err);
    });

    // Log de request
    console.log('🚀 Enviando webhook de prueba...\n');
    console.log('📝 Detalles:');
    console.log(`   URL: ${options.secure ? 'https' : 'http'}://${options.host}:${options.port}/api/webhooks/mercadopago`);
    console.log(`   Orden: ${options.orderNumber}`);
    console.log(`   Status: ${options.status}`);
    console.log(`   Payment ID: ${options.paymentId}`);
    console.log('');

    req.write(payload);
    req.end();
  });
}

// Ejecutar
async function main(): Promise<void> {
  try {
    const options = parseArgs();
    await sendWebhook(options);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
