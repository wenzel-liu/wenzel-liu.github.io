import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function redirectDocument(target) {
  const url = new URL(target);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('A web destination is required.');
  const href = escape(url.href);
  const scriptTarget = JSON.stringify(url.href).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script>const destination=new URL(${scriptTarget});destination.search=location.search;if(location.hash)destination.hash=location.hash;location.replace(destination.href);</script>
<meta http-equiv="refresh" content="0; url=${href}"><link rel="canonical" href="${href}"><title>Wenhao Liu — Page moved</title>
<style>body{margin:0;padding:64px 24px;background:#f6f5f0;color:#183c3d;font-family:system-ui,sans-serif}main{max-width:680px;margin:auto}h1{font-family:Georgia,serif;font-weight:400}a{color:inherit}</style>
</head><body><main><p>Wenhao Liu</p><h1>This page has moved.</h1><p><a href="${href}">Continue to the new address →</a></p></main></body></html>\n`;
}

export async function projectRedirects() {
  const pages = JSON.parse(await readFile(path.join(root, '_content/published-pages.json'), 'utf8'));
  const aliases = JSON.parse(await readFile(path.join(root, 'app/legacy-routes.json'), 'utf8'));
  return { ...Object.fromEntries(pages.map(file => [file, file.replace(/index\.html$/, '')])), ...aliases };
}

export async function writeProjectRedirects(output) {
  const routes = await projectRedirects();
  for (const [file, target] of Object.entries(routes)) {
    const destination = path.join(output, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, redirectDocument(new URL(target, 'https://wenzel-liu.github.io/').href));
  }
  await writeFile(path.join(output, '.nojekyll'), '');
  await writeFile(path.join(output, 'redirect-routes.json'), JSON.stringify(routes, null, 2) + '\n');
  console.log(`Generated ${Object.keys(routes).length} redirects for the former /lwh/ site.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (!process.argv[2]) throw new Error('Pass the redirect publication directory.');
  await writeProjectRedirects(path.resolve(process.argv[2]));
}
