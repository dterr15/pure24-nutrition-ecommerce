// src/utils/imageOptimizer.ts
// Helpers para optimización automática de imágenes

export interface ImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
}

/**
 * Genera srcset automático para imágenes responsive
 */
export function generateImageSrcSet(
  src: string,
  widths: number[] = [400, 800, 1200, 1600]
): { webp: string; jpg: string } {
  const baseFileName = src.replace(/\.\w+$/, '');
  const webpSrcSet = widths
    .map(w => `${baseFileName}-${w}.webp ${w}w`)
    .join(', ');
  const jpgSrcSet = widths
    .map(w => `${baseFileName}-${w}.jpg ${w}w`)
    .join(', ');
  return { webp: webpSrcSet, jpg: jpgSrcSet };
}

/**
 * Genera propiedades optimizadas para imagen crítica (LCP)
 */
export function getCriticalImageProps(config: ImageConfig) {
  const { src, alt, width, height } = config;
  return {
    src,
    alt,
    width,
    height,
    loading: 'eager' as const,
    decoding: 'sync' as const,
    fetchPriority: 'high' as const,
  };
}

/**
 * Genera propiedades optimizadas para imagen no crítica
 */
export function getLazyImageProps(config: ImageConfig) {
  const { src, alt, width, height } = config;
  return {
    src,
    alt,
    width,
    height,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    fetchPriority: 'low' as const,
  };
}

/**
 * Calcula aspect ratio para prevenir layout shift (CLS)
 */
export function getAspectRatio(width: number, height: number): string {
  return ((width / height) * 100).toFixed(2);
}

/**
 * Genera tamaños responsive para <source sizes>
 */
export function getResponsiveSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px';
}

/**
 * Config para imagen hero
 */
export const HERO_IMAGE_CONFIG = {
  sizes: '(max-width: 640px) 100vw, 50vw',
  widths: [400, 800, 1200, 1600],
  priority: true,
} as const;

/**
 * Config para imagen secundaria
 */
export const SECONDARY_IMAGE_CONFIG = {
  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  widths: [300, 600, 900],
  priority: false,
} as const;

/**
 * Config para iconos pequeños
 */
export const ICON_IMAGE_CONFIG = {
  sizes: '48px',
  widths: [48, 96],
  priority: false,
} as const;

/**
 * Estima tamaño WebP vs JPEG
 */
export function estimateWebPSize(jpgSize: number): number {
  return Math.round(jpgSize * 0.7);
}

/**
 * Validación de imagen
 */
export function validateImageAlt(alt: string): { valid: boolean; message: string } {
  const wordCount = alt.trim().split(/\s+/).length;
  if (wordCount < 5) {
    return {
      valid: false,
      message: `Alt text debe tener al menos 5 palabras. Actual: ${wordCount}`,
    };
  }
  if (alt.length > 125) {
    return {
      valid: false,
      message: `Alt text debe tener máximo 125 caracteres. Actual: ${alt.length}`,
    };
  }
  return {
    valid: true,
    message: 'Alt text válido',
  };
}

export default {
  generateImageSrcSet,
  getCriticalImageProps,
  getLazyImageProps,
  getAspectRatio,
  getResponsiveSizes,
  HERO_IMAGE_CONFIG,
  SECONDARY_IMAGE_CONFIG,
  ICON_IMAGE_CONFIG,
  estimateWebPSize,
  validateImageAlt,
};
