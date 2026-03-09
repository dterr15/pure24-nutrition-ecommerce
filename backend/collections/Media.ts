import { CollectionConfig } from 'payload/types';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Imagen',
    plural: 'Imágenes',
  },
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 200,
        height: 200,
        position: 'center',
      },
      {
        name: 'card',
        width: 500,
        height: 500,
        position: 'center',
      },
      {
        name: 'hero',
        width: 1200,
        height: 600,
        position: 'center',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo (SEO)',
      required: true,
      admin: {
        description: 'Importante para accesibilidad y SEO',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Descripción/Caption',
    },
  ],
};
