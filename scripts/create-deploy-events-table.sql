-- FASE 6.4: Crear tabla deploy_events para auditar deploys automáticos
-- Ejecutar en: PostgreSQL (Directus database)

CREATE TABLE IF NOT EXISTS deploy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL DEFAULT 'stock_change_deploy',
  stock_sku VARCHAR(100),
  deploy_id VARCHAR(255),
  deploy_started BOOLEAN DEFAULT FALSE,
  provider VARCHAR(50),
  status_code INTEGER,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_deploy_events_stock_sku ON deploy_events(stock_sku);
CREATE INDEX IF NOT EXISTS idx_deploy_events_provider ON deploy_events(provider);
CREATE INDEX IF NOT EXISTS idx_deploy_events_created_at ON deploy_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deploy_events_deploy_started ON deploy_events(deploy_started);

-- Comentarios
COMMENT ON TABLE deploy_events IS 'Auditoría de deploys automáticos disparados por cambios de stock';
COMMENT ON COLUMN deploy_events.event_type IS 'Tipo de evento (ej: stock_change_deploy)';
COMMENT ON COLUMN deploy_events.stock_sku IS 'SKU del producto que cambió de stock';
COMMENT ON COLUMN deploy_events.deploy_id IS 'ID del deploy en Cloudflare';
COMMENT ON COLUMN deploy_events.deploy_started IS 'Si el deploy se inició correctamente';
COMMENT ON COLUMN deploy_events.provider IS 'Proveedor de hosting (cloudflare, vercel, etc)';
COMMENT ON COLUMN deploy_events.status_code IS 'HTTP status code del deploy hook';
COMMENT ON COLUMN deploy_events.triggered_at IS 'Timestamp cuando se disparó el webhook';

-- Verificar tabla creada
SELECT table_name FROM information_schema.tables WHERE table_name = 'deploy_events';
