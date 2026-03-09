import { CollectionConfig } from 'payload/types';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  auth: true, // Habilita autenticación
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return {
        id: {
          equals: req.user?.id,
        },
      };
    },
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true;
      return {
        id: {
          equals: req.user?.id,
        },
      };
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre completo',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      default: 'user',
      label: 'Rol',
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Usuario', value: 'user' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Teléfono',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar',
    },
    {
      name: 'active',
      type: 'checkbox',
      default: true,
      label: 'Activo',
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
