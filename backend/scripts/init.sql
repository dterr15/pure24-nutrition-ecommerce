-- ============================================
-- PURE24 NUTRITION - Inicialización PostgreSQL
-- ============================================
-- Este archivo se ejecuta automáticamente cuando Docker crea el container

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

-- Comentario: Payload CMS creará las tablas automáticamente via ORM
-- Este archivo es solo para extensiones y configuraciones iniciales

-- Crear schema público si no existe
CREATE SCHEMA IF NOT EXISTS public;

-- Dar permisos al usuario payload
GRANT USAGE ON SCHEMA public TO payload;
GRANT CREATE ON SCHEMA public TO payload;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO payload;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO payload;

-- Log de inicialización
SELECT 'Pure24 Nutrition PostgreSQL initialized' AS status;
