import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const standalone = join(root, '.next', 'standalone');
if (!existsSync(join(standalone, 'server.js'))) {
  console.error('Production build missing. Run npm run build before npm start.');
  process.exit(1);
}
// Next's standalone build intentionally excludes static assets; include them for local serving.
mkdirSync(join(standalone, '.next'), { recursive: true });
cpSync(join(root, '.next', 'static'), join(standalone, '.next', 'static'), { recursive: true });
if (existsSync(join(root, 'public'))) {
  cpSync(join(root, 'public'), join(standalone, 'public'), { recursive: true });
}
process.env.HOSTNAME = '127.0.0.1';
process.env.PORT ||= '3000';
await import(pathToFileURL(join(standalone, 'server.js')).href);
