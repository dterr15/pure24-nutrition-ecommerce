// lighthouse.config.js
// Configuración de Lighthouse para auditorías automáticas
// Pure 24 Nutrition

module.exports = {
  ci: {
    collect: {
      url: [
        'https://pure24nutrition.cl/',
        'https://pure24nutrition.cl/productos',
      ],
      numberOfRuns: 3,
      settings: {
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 150,
          throughputKbps: 1.6 * 1024,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1.6 * 1024,
          uploadThroughputKbps: 750,
          cpuSlowdownMultiplier: 4,
        },
        emulatedFormFactor: 'mobile',
        timeoutMs: 90000,
        disableStorageReset: false,
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': [
          'error',
          { minScore: 0.9 },
        ],
        'categories:accessibility': [
          'error',
          { minScore: 0.9 },
        ],
        'categories:best-practices': [
          'error',
          { minScore: 0.9 },
        ],
        'categories:seo': [
          'error',
          { minScore: 0.95 },
        ],
        'largest-contentful-paint': [
          'error',
          { maxNumericValue: 2500 },
        ],
        'cumulative-layout-shift': [
          'error',
          { maxNumericValue: 0.1 },
        ],
        'first-input-delay': [
          'error',
          { maxNumericValue: 100 },
        ],
        'first-contentful-paint': [
          'error',
          { maxNumericValue: 1800 },
        ],
        'speed-index': [
          'error',
          { maxNumericValue: 3387 },
        ],
        'total-blocking-time': [
          'error',
          { maxNumericValue: 300 },
        ],
        'uses-webp-images': [
          'warn',
          { maxLength: 0 },
        ],
        'image-alt-text': [
          'error',
          { maxLength: 0 },
        ],
        'meta-description': [
          'error',
          { maxLength: 0 },
        ],
        'mobile-friendly': [
          'error',
          { minScore: 1 },
        ],
      },
    },
  },
};
