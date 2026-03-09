#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GBP_NAP = {
  name: 'Pure24 Nutrition',
  streetAddress: 'Jorge Montt 934',
  postalCode: '6200000',
  telephone: '+56 9 7134 5988',
  latitude: '-53.163700',
  longitude: '-70.908100'
};

function validateHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const checks = {
    name: content.includes(`"name":"${GBP_NAP.name}"`) || content.includes(`"name": "${GBP_NAP.name}"`),
    streetAddress: content.includes(GBP_NAP.streetAddress),
    telephone: content.includes(GBP_NAP.telephone),
    postalCode: content.includes(GBP_NAP.postalCode),
    latitude: content.includes(GBP_NAP.latitude),
    longitude: content.includes(GBP_NAP.longitude)
  };
  return Object.values(checks).every(v => v);
}

function scanDist(dir) {
  const results = [];
  function walk(d) {
    fs.readdirSync(d).forEach(f => {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.html')) {
        try {
          const passed = validateHTML(p);
          results.push({ file: p.replace(dir, ''), passed });
        } catch (e) {
          results.push({ file: p.replace(dir, ''), passed: false, error: e.message });
        }
      }
    });
  }
  walk(dir);
  return results;
}

const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Carpeta dist no encontrada. Ejecuta: npm run build');
  process.exit(1);
}

const results = scanDist(distPath);
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

results.forEach(r => {
  console.log(`${r.passed ? '✅' : '❌'} ${r.file}${r.error ? ` (${r.error})` : ''}`);
});

console.log(`\n${passed}/${results.length} archivos válidos`);
process.exit(failed > 0 ? 1 : 0);
