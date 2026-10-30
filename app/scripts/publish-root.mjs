import { access, cp, rm, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const distDir = path.resolve(repoRoot, 'app', 'dist');

const htmlFiles = [
  'index.html', 'blog.html', 'projects.html', 'experience.html', 'research.html',
  ...JSON.parse(await readFile(path.join(repoRoot, 'app/.content-pages.json'), 'utf8'))
];

async function ensureBuildExists() {
  try {
    await access(distDir);
  } catch {
    throw new Error(`Build output not found at ${distDir}. Run \"npm run build\" first.`);
  }
}

async function copyHtmlFiles() {
  const oldFiles = JSON.parse(await readFile(path.join(repoRoot, '_content/published-pages.json'), 'utf8').catch(() => '[]'));
  for (const file of oldFiles) {
    if (!htmlFiles.includes(file) && /^(posts|medprism|sci-industrialist|notes)\/[a-z0-9/-]+\.html$/.test(file)) await rm(path.join(repoRoot, file), { force: true });
  }
  for (const file of htmlFiles) {
    const source = path.resolve(distDir, file);
    const target = path.resolve(repoRoot, file);
    await cp(source, target, { force: true });
  }
  await writeFile(path.join(repoRoot, '_content/published-pages.json'), JSON.stringify(htmlFiles, null, 2) + '\n');
}

async function syncAssets() {
  const sourceAssets = path.resolve(distDir, 'app-assets');
  const targetAssets = path.resolve(repoRoot, 'app-assets');

  await rm(targetAssets, { recursive: true, force: true });
  await cp(sourceAssets, targetAssets, { recursive: true, force: true });
  await cp(path.join(distDir, 'search'), path.join(repoRoot, 'search'), { recursive: true, force: true });
}

async function main() {
  await ensureBuildExists();
  await copyHtmlFiles();
  await syncAssets();
  process.stdout.write('Published app/dist HTML files, app-assets and search indexes to repository root.\n');
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
