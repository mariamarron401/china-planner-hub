/**
 * Genera `dist/precache-manifest.json`: la lista de ficheros propios del build que el service
 * worker guarda en el móvil al instalarse, para que la app pueda abrirse sin red (en China,
 * github.io va lento o no responde a través del Gran Cortafuegos).
 *
 * Se ejecuta solo, después de `vite build` (script `build` de package.json).
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');

// Ni el propio service worker ni su manifiesto se precachean (se pedirían a sí mismos).
const EXCLUDE = new Set(['sw.js', 'precache-manifest.json', 'robots.txt', 'index.html']);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(DIST)
  .map((full) => relative(DIST, full).split(sep).join('/'))
  .filter((rel) => !EXCLUDE.has(rel))
  .map((rel) => `./${rel}`)
  .sort();

writeFileSync(join(DIST, 'precache-manifest.json'), JSON.stringify(files, null, 2));
console.log(`precache-manifest.json: ${files.length} ficheros listos para funcionar sin red.`);
