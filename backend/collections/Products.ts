import { CollectionConfig } from 'payload/types';

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Producto',
    plural: 'Productos',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'price', 'stock', 'category', 'active'],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    // ============== INFORMACIÓN BÁSICA ==============
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre del producto',
      minLength: 3,
      maxLength: 150,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL slug',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Descripción',
      minLength: 20,
      maxLength: 1000,
    },
    {
      name: 'longDescription',
      type: 'richText',
      label: 'Descripción larga (HTML)',
    },
    // ============== SKU Y CÓDIGOS ==============
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      label: 'SKU (código interno)',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'gtin13',
      type: 'text',
      label: 'GTIN-13 (código de barras)',
      validate: (value) => {
        if (value && !/^\d{13}$/.test(value)) {
          return 'GTIN-13 debe tener exactamente 13 dígitos';
        }
        return true;
      },
    },
    {
      name: 'mpn',
      type: 'text',
      label: 'MPN (Manufacturer Part Number)',
    },
    // ============== PRECIOS Y STOCK ==============
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Precio (CLP)',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'discountedPrice',
      type: 'number',
      label: 'Precio con descuento (CLP)',
      min: 0,
      admin: {
        description: 'Si está vacío, se muestra solo el precio normal',
      },
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      default: 0,
      label: 'Stock disponible',
      min: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lowStockThreshold',
      type: 'number',
      default: 10,
      label: 'Threshold para aviso de bajo stock',
      min: 1,
    },
    // ============== CATEGORIZACIÓN ==============
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Categoría',
      options: [
        { label: 'Proteínas', value: 'proteins' },
        { label: 'Aminoácidos', value: 'amino_acids' },
        { label: 'Vitaminas', value: 'vitamins' },
        { label: 'Minerales', value: 'minerals' },
        { label: 'Pre-entrenos', value: 'pre_workout' },
        { label: 'Post-entrenos', value: 'post_workout' },
        { label: 'Quemagrasas', value: 'fat_burners' },
        { label: 'Digestivos', value: 'digestive' },
        { label: 'Otros', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags (para búsqueda)',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Ej: sin gluten, vegano, importado, etc.',
      },
    },
    // ============== IMÁGENES ==============
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Imagen principal',
      admin: {
        description: 'Imagen en alta resolución para mostrar en el catálogo',
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Galería de imágenes',
      maxRows: 10,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Texto alternativo (SEO)',
        },
      ],
      admin: {
        description: 'Hasta 10 imágenes adicionales',
      },
    },
    // ============== ESPECIFICACIONES TÉCNICAS ==============
    {
      name: 'specifications',
      type: 'group',
      label: 'Especificaciones',
      fields: [
        {
          name: 'servingSize',
          type: 'text',
          label: 'Tamaño de porción (ej: 25g, 1 scoop)',
        },
        {
          name: 'servingsPerContainer',
          type: 'number',
          label: 'Porciones por envase',
          min: 1,
        },
        {
          name: 'ingredient',
          type: 'text',
          label: 'Ingrediente activo principal',
          admin: {
            description: 'Ej: Whey Protein Isolate, Creatine Monohydrate',
          },
        },
        {
          name: 'ingredientAmount',
          type: 'text',
          label: 'Cantidad por porción',
          admin: {
            description: 'Ej: 25g, 5g, 1000mg',
          },
        },
        {
          name: 'weight',
          type: 'text',
          label: 'Peso total del envase',
          admin: {
            description: 'Ej: 1kg, 500g, 180 cápsulas',
          },
        },
        {
          name: 'manufacturer',
          type: 'text',
          label: 'Fabricante',
        },
        {
          name: 'origin',
          type: 'select',
          label: 'País de origen',
          options: [
            { label: 'Chile', value: 'chile' },
            { label: 'USA', value: 'usa' },
            { label: 'Canadá', value: 'canada' },
            { label: 'Europa', value: 'europe' },
            { label: 'Otro', value: 'other' },
          ],
        },
      ],
    },
    // ============== DOSIFICACIÓN (para calculadora) ==============
    {
      name: 'dosage',
      type: 'group',
      label: 'Información de dosificación',
      fields: [
        {
          name: 'recommendedDaily',
          type: 'text',
          label: 'Dosis diaria recomendada',
          admin: {
            description: 'Ej: 25g, 1-2 cápsulas, 5g por día',
          },
        },
        {
          name: 'maxDaily',
          type: 'text',
          label: 'Dosis máxima diaria',
        },
        {
          name: 'timing',
          type: 'select',
          label: 'Mejor momento para tomar',
          options: [
            { label: 'Mañana', value: 'morning' },
            { label: 'Pre-entreno', value: 'pre_workout' },
            { label: 'Post-entreno', value: 'post_workout' },
            { label: 'Noche', value: 'evening' },
            { label: 'Cualquier momento', value: 'anytime' },
          ],
        },
      ],
    },
    // ============== ENVÍO ==============
    {
      name: 'shipping',
      type: 'group',
      label: 'Información de envío',
      fields: [
        {
          name: 'weight',
          type: 'number',
          label: 'Peso para envío (kg)',
          min: 0,
        },
        {
          name: 'shippingClass',
          type: 'select',
          label: 'Clase de envío',
          options: [
            { label: 'Estándar (sin costo extra)', value: 'standard' },
            { label: 'Frágil (+$5,000)', value: 'fragile' },
            { label: 'Premium (+$10,000)', value: 'premium' },
          ],
        },
        {
          name: 'freeShippingThreshold',
          type: 'number',
          label: 'Envío gratis si el carrito > (CLP)',
        },
      ],
    },
    // ============== SEO ==============
    {
      name: 'seo',
      type: 'group',
      label: 'SEO & Metadata',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title (<60 chars)',
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description (<160 chars)',
          maxLength: 160,
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Keywords (separados por coma)',
        },
      ],
    },
    // ============== ESTADO ==============
    {
      name: 'active',
      type: 'checkbox',
      default: true,
      label: 'Activo en catálogo',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      default: false,
      label: 'Destacado en homepage',
      admin: {
        position: 'sidebar',
      },
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
