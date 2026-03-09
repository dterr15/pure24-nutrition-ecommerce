import { buildConfig } from 'payload/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Users, Media, Products, Orders } from './collections';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Admin UI
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Pure24 CMS',
      favicon: '/favicon.ico',
    },
  },

  // Collections
  collections: [
    Users,
    Media,
    Products,
    Orders,
  ],

  // Database
  db: {
    adapter: 'postgres',
    url: process.env.DATABASE_URI || 'postgresql://payload:payload_dev_password@postgres:5432/pure24_db',
    pool: {
      min: 1,
      max: 10,
    },
  },

  // Secret
  secret: process.env.PAYLOAD_SECRET || 'dev_secret_key_change_in_production',

  // Server
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',

  // Upload
  upload: {
    limits: {
      fileSize: 5000000,
    },
  },

  // Paths
  paths: {
    collections: path.join(dirname, 'collections'),
    globals: path.join(dirname, 'globals'),
    media: path.join(dirname, 'media'),
  },

  // Hooks
  hooks: {
    beforeValidate: [],
    beforeChange: [],
    afterChange: [],
  },

  // Globals (opcional - agregar después)
  globals: [],

  // Middleware
  middleware: [
    (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    },
  ],

  // TypeScript
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Plugins
  plugins: [],
});
