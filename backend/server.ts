import express from 'express';
import payload from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleMercadoPagoWebhook,
  healthCheck,
} from './webhooks/mercadopago.webhook';
import { emailService } from './services/email.service';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============== MIDDLEWARE ==============
// JSON body parser para webhooks
app.use(express.json());

// ============== HEALTH CHECKS ==============
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/webhooks/mercadopago/health', healthCheck);

// ============== WEBHOOKS ==============
// Webhook de Mercado Pago
app.post('/api/webhooks/mercadopago', handleMercadoPagoWebhook);

// ============== INICIALIZACIÓN ==============
const start = async () => {
  // Inicializar servicio de email
  await emailService.initialize();

  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'dev_secret',
    express: app,
    onInit: async () => {
      console.log('✅ Payload CMS iniciado correctamente');
      console.log(`📍 Admin panel: http://localhost:${PORT}/admin`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`🔔 Webhook: http://localhost:${PORT}/api/webhooks/mercadopago`);
    },
  });

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
  });
};

start().catch((err) => {
  console.error('❌ Error iniciando Payload:', err);
  process.exit(1);
});
