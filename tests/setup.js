/**
 * Global vitest setup: installs a fetch mock that serves format files from
 * disk. Tests that need a different fetch behavior can override global.fetch
 * in their own beforeEach.
 */
import {vi} from 'vitest';
import fs from 'fs';
import {resolve, dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const minimalMd = fs.readFileSync(resolve(__dirname, '../formats/minimal.md'), 'utf8');
const modernMd = fs.readFileSync(resolve(__dirname, '../formats/modern.md'), 'utf8');
const elegantMd = fs.readFileSync(resolve(__dirname, '../formats/elegant.md'), 'utf8');
const manifestJson = fs.readFileSync(resolve(__dirname, '../formats/index.json'), 'utf8');

global.fetch = vi.fn((url) => {
  if (url.endsWith('index.json')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(JSON.parse(manifestJson)),
    });
  }
  if (url.endsWith('minimal.md')) {
    return Promise.resolve({ok: true, text: () => Promise.resolve(minimalMd)});
  }
  if (url.endsWith('modern.md')) {
    return Promise.resolve({ok: true, text: () => Promise.resolve(modernMd)});
  }
  if (url.endsWith('elegant.md')) {
    return Promise.resolve({ok: true, text: () => Promise.resolve(elegantMd)});
  }
  return Promise.resolve({ok: false, text: () => Promise.resolve('')});
});
