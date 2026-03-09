import { CollectionConfig } from 'payload/types';

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Orden',
    plural: 'Órdenes',
  },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customerEmail', 'status', 'total', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return {
        customerEmail: {
          equals: req.user?.email,
        },
      };
    },
    create: () => true,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    // ============== NÚMERO DE ORDEN ==============
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Número de orden',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    // ============== INFORMACIÓN DEL CLIENTE ==============
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
      label: 'Email del cliente',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Nombre del cliente',
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
      label: 'Teléfono del cliente',
      validate: (value) => {
        if (!/^\+?[0-9\s\-()]{8,}$/.test(value)) {
          return 'Teléfono inválido';
        }
        return true;
      },
    },
    // ============== DIRECCIÓN DE ENVÍO ==============
    {
      name: 'shipping',
      type: 'group',
      label: 'Dirección de envío',
      fields: [
        {
          name: 'street',
          type: 'text',
          required: true,
          label: 'Calle y número',
        },
        {
          name: 'apartment',
          type: 'text',
          label: 'Apto/Casa (opcional)',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'Ciudad',
          admin: {
            description: 'Para Punta Arenas: "Punta Arenas"',
          },
        },
        {
          name: 'region',
          type: 'text',
          required: true,
          label: 'Región',
          admin: {
            description: 'Ej: Magallanes y de la Antártica Chilena',
          },
        },
        {
          name: 'postalCode',
          type: 'text',
          required: true,
          label: 'Código postal',
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          default: 'Chile',
          label: 'País',
        },
      ],
    },
    // ============== ITEMS DEL CARRITO ==============
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Productos en la orden',
      minRows: 1,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: 'Producto',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          label: 'Cantidad',
        },
        {
          name: 'priceAtPurchase',
          type: 'number',
          required: true,
          label: 'Precio en el momento de compra (CLP)',
          admin: {
            readOnly: true,
            description: 'Snapshot del precio para auditoría',
          },
        },
      ],
    },
    // ============== TOTALES ==============
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      label: 'Subtotal (CLP)',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'shippingCost',
      type: 'number',
      default: 0,
      label: 'Costo de envío (CLP)',
    },
    {
      name: 'discount',
      type: 'number',
      default: 0,
      label: 'Descuento aplicado (CLP)',
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      label: 'Total (CLP)',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    // ============== MERCADO PAGO ==============
    {
      name: 'mercadoPago',
      type: 'group',
      label: 'Mercado Pago',
      fields: [
        {
          name: 'transactionId',
          type: 'text',
          unique: true,
          label: 'Transaction ID de Mercado Pago',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'paymentId',
          type: 'text',
          label: 'Payment ID',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'paymentMethod',
          type: 'select',
          label: 'Método de pago',
          options: [
            { label: 'Tarjeta de crédito', value: 'credit_card' },
            { label: 'Tarjeta de débito', value: 'debit_card' },
            { label: 'Transferencia bancaria', value: 'bank_transfer' },
            { label: 'Efectivo', value: 'cash' },
            { label: 'Billetera digital', value: 'digital_wallet' },
            { label: 'Otro', value: 'other' },
          ],
        },
        {
          name: 'installments',
          type: 'number',
          default: 1,
          label: 'Cuotas',
          min: 1,
          max: 24,
        },
      ],
    },
    // ============== ESTADO DE LA ORDEN ==============
    {
      name: 'status',
      type: 'select',
      required: true,
      default: 'pending',
      label: 'Estado de la orden',
      options: [
        { label: '⏳ Pendiente de pago', value: 'pending' },
        { label: '✅ Pagada', value: 'paid' },
        { label: '📦 Preparando envío', value: 'processing' },
        { label: '🚚 Enviada', value: 'shipped' },
        { label: '✔️ Entregada', value: 'delivered' },
        { label: '❌ Cancelada', value: 'cancelled' },
        { label: '⚠️ Problema con pago', value: 'payment_failed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    // ============== NOTAS ==============
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notas internas',
      admin: {
        description: 'Solo visible para admin',
      },
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      label: 'Notas del cliente',
    },
    // ============== TRACKING ==============
    {
      name: 'tracking',
      type: 'group',
      label: 'Tracking de envío',
      fields: [
        {
          name: 'carrier',
          type: 'text',
          label: 'Empresa de envío',
          admin: {
            description: 'Ej: Starken, DHL, Correos Chile',
          },
        },
        {
          name: 'trackingNumber',
          type: 'text',
          label: 'Número de tracking',
        },
        {
          name: 'estimatedDelivery',
          type: 'date',
          label: 'Fecha estimada de entrega',
        },
        {
          name: 'actualDelivery',
          type: 'date',
          label: 'Fecha real de entrega',
        },
      ],
    },
    // ============== TIMESTAMPS ==============
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
};
