/**
 * Email Service
 * Maneja envío de emails transaccionales para Pure24
 * Integrable con SendGrid, Resend, SMTP, etc.
 */

import nodemailer from 'nodemailer';
import type { Order } from '../collections/Orders';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderEmailData {
  order: Order;
  customerName: string;
  customerEmail: string;
}

/**
 * Email Service - Singleton para gestionar envío de emails
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  /**
   * Inicializa el servicio de email según variables de entorno
   */
  async initialize(): Promise<void> {
    try {
      // Detectar proveedor
      const provider = process.env.EMAIL_PROVIDER || 'smtp';

      if (provider === 'sendgrid') {
        this.initializeSendGrid();
      } else if (provider === 'resend') {
        this.initializeResend();
      } else {
        // Fallback a SMTP
        this.initializeSMTP();
      }

      this.isConfigured = true;
      console.log('✅ Email service inicializado:', provider);
    } catch (error) {
      console.warn('⚠️ Email service no configurado. Emails serán logeados a consola.');
      this.isConfigured = false;
    }
  }

  /**
   * Inicializa SendGrid
   */
  private initializeSendGrid(): void {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    this.transporter = {
      sendMail: async (mailOptions: any) => {
        const msg = {
          to: mailOptions.to,
          from: process.env.EMAIL_FROM || 'noreply@pure24.cl',
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text,
        };
        return sgMail.send(msg);
      },
    } as any;
  }

  /**
   * Inicializa Resend
   */
  private initializeResend(): void {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    this.transporter = {
      sendMail: async (mailOptions: any) => {
        return resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@pure24.cl',
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
        });
      },
    } as any;
  }

  /**
   * Inicializa SMTP genérico (Gmail, Mailgun, etc.)
   */
  private initializeSMTP(): void {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Envía un email
   */
  async send(options: EmailOptions): Promise<boolean> {
    // Si está en modo desarrollo o no está configurado, log a consola
    if (!this.isConfigured || process.env.NODE_ENV === 'development') {
      console.log(`📧 [EMAIL] ${options.subject}`);
      console.log(`   To: ${options.to}`);
      console.log(`   Body: ${options.html.substring(0, 100)}...`);
      return true;
    }

    try {
      if (!this.transporter) {
        throw new Error('Email transporter no inicializado');
      }

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@pure24.cl',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`✅ Email enviado a ${options.to}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  /**
   * Email: Confirmación de orden
   */
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const html = this.renderOrderConfirmationTemplate(data);
    return this.send({
      to: data.customerEmail,
      subject: `Orden #${data.order.orderNumber} - Pure24 Nutrition`,
      html,
    });
  }

  /**
   * Email: Pago recibido
   */
  async sendPaymentReceived(data: OrderEmailData): Promise<boolean> {
    const html = this.renderPaymentReceivedTemplate(data);
    return this.send({
      to: data.customerEmail,
      subject: `✅ Pago confirmado - Orden #${data.order.orderNumber}`,
      html,
    });
  }

  /**
   * Email: Preparando envío
   */
  async sendProcessingNotification(data: OrderEmailData): Promise<boolean> {
    const html = this.renderProcessingTemplate(data);
    return this.send({
      to: data.customerEmail,
      subject: `📦 Tu orden está siendo preparada - #${data.order.orderNumber}`,
      html,
    });
  }

  /**
   * Email: Paquete enviado
   */
  async sendShippingNotification(
    data: OrderEmailData,
    trackingNumber?: string
  ): Promise<boolean> {
    const html = this.renderShippingTemplate(data, trackingNumber);
    return this.send({
      to: data.customerEmail,
      subject: `🚚 Tu paquete está en camino - #${data.order.orderNumber}`,
      html,
    });
  }

  /**
   * Email: Pago fallido
   */
  async sendPaymentFailed(data: OrderEmailData, reason?: string): Promise<boolean> {
    const html = this.renderPaymentFailedTemplate(data, reason);
    return this.send({
      to: data.customerEmail,
      subject: `⚠️ Problema con tu pago - Orden #${data.order.orderNumber}`,
      html,
    });
  }

  // ============== PLANTILLAS ==============

  private renderOrderConfirmationTemplate(data: OrderEmailData): string {
    const { order, customerName } = data;
    return `
      <!DOCTYPE html>
      <html dir="ltr" lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { padding: 15px 0; font-size: 18px; font-weight: 700; color: #1a1a1a; }
          .footer { background: white; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Orden Recibida ✅</h1>
            <p style="margin: 10px 0; opacity: 0.9;">Orden #${order.orderNumber}</p>
          </div>

          <div class="content">
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Hemos recibido tu orden. Te estamos preparando los productos y pronto los enviaremos a:</p>

            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>${order.shipping.street}</strong></p>
              <p style="margin: 5px 0;">${order.shipping.city}, ${order.shipping.region}</p>
              <p style="margin: 5px 0;">${order.shipping.country}</p>
            </div>

            <h3 style="margin-top: 20px;">Resumen de tu orden:</h3>
            ${order.items.map(item => `
              <div class="item">
                <span>${item.quantity}x Producto</span>
                <span>$${(item.priceAtPurchase * item.quantity).toLocaleString('es-CL')}</span>
              </div>
            `).join('')}

            <div class="item" style="font-weight: 700;">
              <span>Subtotal</span>
              <span>$${order.subtotal.toLocaleString('es-CL')}</span>
            </div>
            ${order.shippingCost > 0 ? `
              <div class="item">
                <span>Envío</span>
                <span>$${order.shippingCost.toLocaleString('es-CL')}</span>
              </div>
            ` : `
              <div class="item" style="color: #059669;">
                <span>🎉 Envío Gratis</span>
                <span>-$5,000</span>
              </div>
            `}
            ${order.discount > 0 ? `
              <div class="item" style="color: #dc2626;">
                <span>Descuento</span>
                <span>-$${order.discount.toLocaleString('es-CL')}</span>
              </div>
            ` : ''}

            <div class="total" style="border-top: 2px solid #e5e7eb; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between;">
                <span>TOTAL</span>
                <span>$${order.total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Recibirás un email cuando tu paquete sea enviado.</p>
            <p>Si tienes preguntas, contacta a <strong>hola@pure24.cl</strong> o llama al <strong>+56 9 7134 5988</strong></p>
            <p style="margin-top: 20px; opacity: 0.7;">© 2026 Pure24 Nutrition. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private renderPaymentReceivedTemplate(data: OrderEmailData): string {
    const { order, customerName } = data;
    return `
      <!DOCTYPE html>
      <html dir="ltr" lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f0fdf4; padding: 20px; }
          .footer { background: white; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pago Confirmado</h1>
            <p style="margin: 10px 0; opacity: 0.9;">Orden #${order.orderNumber}</p>
          </div>

          <div class="content">
            <p>¡Excelente, ${customerName}!</p>
            <p>Tu pago ha sido procesado correctamente. Tu orden se está preparando para envío.</p>

            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #059669;">
              <p style="margin: 5px 0;"><strong>Monto pagado:</strong></p>
              <p style="margin: 5px 0; font-size: 24px; font-weight: 700; color: #059669;">$${order.total.toLocaleString('es-CL')}</p>
            </div>

            <p>Próximos pasos:</p>
            <ul style="color: #374151;">
              <li>📦 Preparamos tu paquete (1-2 días)</li>
              <li>🚚 Lo enviamos (recibirás tracking)</li>
              <li>📍 Llega a tu domicilio</li>
            </ul>
          </div>

          <div class="footer">
            <p>Puedes ver el estado de tu orden en cualquier momento.</p>
            <p>Contacto: <strong>hola@pure24.cl</strong> | <strong>+56 9 7134 5988</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private renderProcessingTemplate(data: OrderEmailData): string {
    const { order, customerName } = data;
    return `
      <!DOCTYPE html>
      <html dir="ltr" lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #fffbeb; padding: 20px; }
          .footer { background: white; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Preparando tu envío</h1>
            <p style="margin: 10px 0; opacity: 0.9;">Orden #${order.orderNumber}</p>
          </div>

          <div class="content">
            <p>Hola ${customerName},</p>
            <p>Estamos preparando tu paquete con mucho cuidado. Pronto recibirás un email con el número de tracking para que puedas seguir tu envío en tiempo real.</p>

            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>¿Qué contiene tu orden?</strong></p>
              ${order.items.map(item => `<p style="margin: 3px 0;">✓ ${item.quantity}x Producto</p>`).join('')}
            </div>

            <p style="color: #6b7280; font-size: 14px;">Tiempo estimado: 24-48 horas</p>
          </div>

          <div class="footer">
            <p>¿Alguna pregunta? Escribenos: <strong>hola@pure24.cl</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private renderShippingTemplate(data: OrderEmailData, trackingNumber?: string): string {
    const { order, customerName } = data;
    return `
      <!DOCTYPE html>
      <html dir="ltr" lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #eff6ff; padding: 20px; }
          .footer { background: white; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .tracking-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 ¡Tu paquete está en camino!</h1>
            <p style="margin: 10px 0; opacity: 0.9;">Orden #${order.orderNumber}</p>
          </div>

          <div class="content">
            <p>¡Hola ${customerName}!</p>
            <p>Tu paquete ha sido enviado y está en camino a tu domicilio. Usa el número de tracking para seguirlo en tiempo real.</p>

            ${trackingNumber ? `
              <div class="tracking-box">
                <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">NÚMERO DE TRACKING</p>
                <p style="margin: 5px 0; font-size: 20px; font-weight: 700; color: #1e40af; font-family: monospace;">${trackingNumber}</p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Empresa: ${order.tracking?.carrier || 'Starken'}</p>
              </div>
            ` : ''}

            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Enviando a:</strong></p>
              <p style="margin: 5px 0;">${order.shipping.street}</p>
              <p style="margin: 5px 0;">${order.shipping.city}, ${order.shipping.region}</p>
              <p style="margin: 5px 0;"><strong>Fecha estimada:</strong> ${order.tracking?.estimatedDelivery || '2-5 días hábiles'}</p>
            </div>
          </div>

          <div class="footer">
            <p>Seguimiento disponible en: <strong>starken.com</strong></p>
            <p>Duda: <strong>hola@pure24.cl</strong> | <strong>+56 9 7134 5988</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private renderPaymentFailedTemplate(data: OrderEmailData, reason?: string): string {
    const { order, customerName } = data;
    return `
      <!DOCTYPE html>
      <html dir="ltr" lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #fef2f2; padding: 20px; }
          .footer { background: white; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Problema con tu pago</h1>
            <p style="margin: 10px 0; opacity: 0.9;">Orden #${order.orderNumber}</p>
          </div>

          <div class="content">
            <p>Hola ${customerName},</p>
            <p>Tu pago no pudo ser procesado. Esto puede ocurrir por:</p>

            <ul style="color: #374151;">
              <li>Fondos insuficientes</li>
              <li>Tarjeta vencida</li>
              <li>Límite de transacción excedido</li>
              <li>Datos ingresados incorrectamente</li>
            </ul>

            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 5px 0;"><strong>Monto intentado:</strong></p>
              <p style="margin: 5px 0; font-size: 24px; font-weight: 700; color: #dc2626;">$${order.total.toLocaleString('es-CLP')}</p>
              ${reason ? `<p style="margin: 10px 0; color: #6b7280; font-size: 12px;">Motivo: ${reason}</p>` : ''}
            </div>

            <p style="color: #374151;">
              <strong>¿Qué hacer?</strong><br>
              Por favor, intenta nuevamente con:
            </p>
            <ul style="color: #374151;">
              <li>Otra tarjeta o método de pago</li>
              <li>Verificando los datos (número, CVV, fecha)</li>
              <li>Contactando a tu banco</li>
            </ul>

            <p>Tu orden seguirá disponible en nuestro sistema por 24 horas.</p>
          </div>

          <div class="footer">
            <p>¿Necesitas ayuda? Contacta: <strong>hola@pure24.cl</strong> o <strong>+56 9 7134 5988</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Exportar singleton
export const emailService = new EmailService();
