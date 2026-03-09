/**
 * Mercado Pago Webhook Handler
 * Procesa notificaciones de pago de Mercado Pago
 *
 * Webhook URL: https://api.pure24.cl/api/webhooks/mercadopago
 *
 * Configurar en Mercado Pago:
 * 1. Dashboard > Configuración > Webhooks
 * 2. Agregar evento: payment.created, payment.updated
 * 3. URL: https://api.pure24.cl/api/webhooks/mercadopago
 * 4. Token de verificación: MERCADOPAGO_WEBHOOK_TOKEN (env var)
 */

import { Request, Response } from 'express';
import payload from 'payload';
import { emailService } from '../services/email.service';

interface MercadoPagoWebhookBody {
  action: string;
  type: string;
  data: {
    id: number;
  };
}

interface PaymentData {
  id: number;
  status: string;
  status_detail: string;
  external_reference?: string;
  payer: {
    id: number;
    email: string;
  };
  transaction_amount: number;
  payment_method_id: string;
  installments: number;
  created_at: string;
}

/**
 * Handler del webhook de Mercado Pago
 * Recibe notificaciones de pagos y actualiza órdenes
 */
export async function handleMercadoPagoWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log('🔔 Webhook Mercado Pago recibido:', req.body);

    // Verificar estructura básica
    const body = req.body as MercadoPagoWebhookBody;

    if (!body.action || !body.data) {
      console.warn('⚠️ Webhook sin estructura válida');
      res.status(400).json({ error: 'Invalid webhook structure' });
      return;
    }

    // Solo procesar pagos (ignorar otros eventos)
    if (body.action !== 'payment.created' && body.action !== 'payment.updated') {
      res.status(200).json({ message: 'Event ignored' });
      return;
    }

    // Obtener detalles del pago
    const paymentId = body.data.id;
    const paymentData = await fetchPaymentData(paymentId);

    if (!paymentData) {
      console.warn(`⚠️ No se pudo obtener datos del pago ${paymentId}`);
      res.status(500).json({ error: 'Could not fetch payment data' });
      return;
    }

    // Buscar orden usando external_reference (orderNumber)
    const orderNumber = paymentData.external_reference;

    if (!orderNumber) {
      console.warn(`⚠️ Pago ${paymentId} sin external_reference`);
      res.status(400).json({ error: 'No order number in payment' });
      return;
    }

    // Obtener orden de Payload
    const orders = await payload.find({
      collection: 'orders',
      where: {
        orderNumber: {
          equals: orderNumber,
        },
      },
    });

    if (orders.docs.length === 0) {
      console.warn(`⚠️ Orden ${orderNumber} no encontrada`);
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = orders.docs[0];

    // Actualizar orden según estado del pago
    await updateOrderFromPayment(order.id, paymentData, order);

    res.status(200).json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('❌ Error en webhook Mercado Pago:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Obtiene datos del pago desde Mercado Pago API
 * En desarrollo, retorna datos simulados
 */
async function fetchPaymentData(paymentId: number): Promise<PaymentData | null> {
  // Modo desarrollo: simular respuesta
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 [DEV] Simulando obtención de pago ${paymentId}`);

    return {
      id: paymentId,
      status: 'approved',
      status_detail: 'accredited',
      external_reference: `ORD-${Date.now()}`,
      payer: {
        id: 123456,
        email: 'customer@example.com',
      },
      transaction_amount: 50000,
      payment_method_id: 'credit_card',
      installments: 1,
      created_at: new Date().toISOString(),
    };
  }

  try {
    // En producción: obtener de Mercado Pago API
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ Error obtiendo pago de Mercado Pago: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error obteniendo datos de Mercado Pago:', error);
    return null;
  }
}

/**
 * Actualiza la orden según el estado del pago
 */
async function updateOrderFromPayment(
  orderId: string | number,
  paymentData: PaymentData,
  existingOrder: any
): Promise<void> {
  let newStatus: string = 'pending';
  let shouldSendEmail = false;
  let emailTemplate: 'payment_received' | 'payment_failed' | 'processing' | null =
    null;

  console.log(`💳 Procesando pago ${paymentData.id} - Estado: ${paymentData.status}`);

  // Determinar nuevo estado basado en respuesta de Mercado Pago
  switch (paymentData.status) {
    case 'approved':
      newStatus = 'paid';
      shouldSendEmail = true;
      emailTemplate = 'payment_received';
      console.log(`✅ Pago aprobado - Orden ${orderId}`);
      break;

    case 'pending':
      newStatus = 'pending';
      console.log(`⏳ Pago pendiente - Orden ${orderId}`);
      break;

    case 'authorized':
      newStatus = 'pending';
      console.log(`⏳ Pago autorizado (esperando captura) - Orden ${orderId}`);
      break;

    case 'rejected':
      newStatus = 'payment_failed';
      shouldSendEmail = true;
      emailTemplate = 'payment_failed';
      console.log(
        `❌ Pago rechazado - Orden ${orderId} - Razón: ${paymentData.status_detail}`
      );
      break;

    case 'cancelled':
      newStatus = 'cancelled';
      shouldSendEmail = true;
      emailTemplate = 'payment_failed';
      console.log(`❌ Pago cancelado - Orden ${orderId}`);
      break;

    case 'in_process':
      newStatus = 'pending';
      console.log(`⏳ Pago en proceso - Orden ${orderId}`);
      break;

    case 'in_mediation':
      newStatus = 'pending';
      console.log(`⏳ Pago en mediación - Orden ${orderId}`);
      break;

    case 'refunded':
      newStatus = 'cancelled';
      shouldSendEmail = true;
      emailTemplate = 'payment_failed';
      console.log(`💸 Pago reembolsado - Orden ${orderId}`);
      break;

    default:
      console.warn(`⚠️ Estado de pago desconocido: ${paymentData.status}`);
      return;
  }

  // Actualizar orden en Payload
  try {
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        status: newStatus,
        'mercadoPago.paymentId': paymentData.id.toString(),
        'mercadoPago.paymentMethod': paymentData.payment_method_id,
        'mercadoPago.installments': paymentData.installments,
        notes:
          `Pago procesado: ${paymentData.status_detail || paymentData.status}. ` +
          existingOrder.notes || '',
      },
    });

    console.log(`✅ Orden ${orderId} actualizada a estado: ${newStatus}`);
  } catch (error) {
    console.error(`❌ Error actualizando orden ${orderId}:`, error);
    throw error;
  }

  // Enviar email transaccional
  if (shouldSendEmail && emailTemplate) {
    try {
      // Refrescar datos de la orden
      const updatedOrder = await payload.findByID({
        collection: 'orders',
        id: orderId,
      });

      await sendTransactionalEmail(updatedOrder, emailTemplate);
    } catch (error) {
      console.error(`⚠️ Error enviando email para orden ${orderId}:`, error);
      // No fallar el webhook si falla el email
    }
  }

  // Si pago aprobado, actualizar a "processing"
  if (newStatus === 'paid') {
    try {
      setTimeout(async () => {
        await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            status: 'processing',
          },
        });
        console.log(`📦 Orden ${orderId} actualizada a "processing"`);

        // Enviar email de procesamiento
        const order = await payload.findByID({
          collection: 'orders',
          id: orderId,
        });

        await sendTransactionalEmail(order, 'processing');
      }, 5000); // Esperar 5 segundos antes de cambiar a processing
    } catch (error) {
      console.error(`⚠️ Error al cambiar orden a processing:`, error);
    }
  }
}

/**
 * Envía emails transaccionales según el evento
 */
async function sendTransactionalEmail(
  order: any,
  template: 'payment_received' | 'payment_failed' | 'processing'
): Promise<void> {
  const emailData = {
    order,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
  };

  switch (template) {
    case 'payment_received':
      console.log(`📧 Enviando email de pago confirmado a ${order.customerEmail}`);
      await emailService.sendPaymentReceived(emailData);
      break;

    case 'payment_failed':
      console.log(`📧 Enviando email de pago fallido a ${order.customerEmail}`);
      await emailService.sendPaymentFailed(
        emailData,
        order.mercadoPago?.statusDetail
      );
      break;

    case 'processing':
      console.log(
        `📧 Enviando email de procesamiento de orden a ${order.customerEmail}`
      );
      await emailService.sendProcessingNotification(emailData);
      break;
  }
}

/**
 * Health check para verificar que el webhook está activo
 */
export function healthCheck(req: Request, res: Response): void {
  res.status(200).json({
    status: 'webhook_active',
    timestamp: new Date().toISOString(),
  });
}
