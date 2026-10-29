import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadArticles } from './article-content.mjs';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.dirname(app);
const renderer = path.join(app, '.content-renderer.mjs');
await build({
  entryPoints: [path.join(app, 'src/ssg/ContentDocument.tsx')], outfile: renderer,
  bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
  external: ['react', 'react-dom/server'], tsconfig: path.join(app, 'tsconfig.json'),
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/') }
});
const { renderArticle, renderCollection, collections } = await import(pathToFileURL(renderer));
const articles = await loadArticles(path.join(root, '_content'));
const previous = JSON.parse(await readFile(path.join(app, '.content-pages.json'), 'utf8').catch(() => '[]'));
for (const name of previous) {
  if (/^(posts|medprism|sci-industrialist|notes)\/[a-z0-9/-]+\.html$/.test(name)) await rm(path.join(app, name), { force: true });
}
const pagePaths = [];
const bootScript = (await readFile(path.join(app, 'index.html'), 'utf8')).match(/<script>([\s\S]+?)<\/script>/)[1];
const escape = (text) => String(text).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
async function writePage(file, title, description, body, lang = 'en', math = false, article = null) {
  const canonical = 'https://wenzel-liu.github.io/' + file.replace(/index\.html$/, '');
  const structuredData = article ? `<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org', '@type':'Article', headline:title, datePublished:article.date, dateModified:article.updated || article.date, inLanguage:lang, url:canonical, author:{'@type':'Person',name:'Wenhao Liu'} }).replaceAll('<','\\u003c')}</script>` : '';
  const html = `<!doctype html>\n<html lang="${escape(lang)}" data-theme="light"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} | Wenhao Liu</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:url" content="${canonical}"><link rel="icon" href="/assets/images/favicon.ico"><link rel="stylesheet" href="/assets/css/fonts.css"><link rel="stylesheet" href="/src/styles/site.css">${math ? '<link rel="stylesheet" href="/src/styles/math.css">' : ''}<script>${bootScript}</script>${structuredData}</head><body>${body}<script type="module" src="/src/entries/article.ts"></script></body></html>\n`;
  await mkdir(path.dirname(path.join(app, file)), { recursive: true });
  await writeFile(path.join(app, file), html);
  pagePaths.push(file);
}
for (const article of articles) {
  const related = articles.filter(other => other.collection === article.collection && other.path !== article.path);
  await writePage(article.path, article.title, article.description, renderArticle(article, related), article.lang, article.math, article);
}
for (const collection of ['medprism','sci-industrialist']) {
  const items = articles.filter(article => article.collection === collection);
  await writePage(`${collection}/index.html`, collections[collection].title, collections[collection].description, renderCollection(collection, items));
}
const metadata = articles.map(({ html, headings, math, source_id, ...metadata }) => metadata);
await writeFile(path.join(app, 'src/content/article-index.ts'), `// Generated from _content by npm run content:generate. No article bodies are shipped here.\nexport const articleIndex = ${JSON.stringify(metadata,null,2)};\nexport const personalNotes = ${JSON.stringify(metadata.filter(article => article.collection === 'notes').map(article => ({title: article.title, description: article.description, href: '/' + article.path})), null, 2)};\n`);
await writeFile(path.join(app, '.content-pages.json'), JSON.stringify(pagePaths, null, 2) + '\n');
await rm(renderer);
console.log(`Generated ${articles.length} independent articles and 2 project collections.`);
