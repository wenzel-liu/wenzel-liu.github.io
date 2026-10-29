import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { projectRedirects, redirectDocument } from '../scripts/project-redirects.mjs';

test('every canonical page loads from the account root without old project URLs', async ({ page }) => {
  const pages: string[] = JSON.parse(readFileSync(new URL('../../_content/published-pages.json', import.meta.url), 'utf8'));
  const failures: string[] = [];
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  page.on('request', request => { if (new URL(request.url()).pathname.startsWith('/lwh/')) failures.push(request.url()); });
  for (const file of pages) {
    await page.goto(file);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://wenzel-liu.github.io/' + file.replace(/index\.html$/, ''));
    await expect(page.locator('a[href^="/lwh/"], img[src^="/lwh/"]')).toHaveCount(0);
  }
  expect(failures).toEqual([]);
});

test('all former project pages redirect to their corresponding root page', async ({ page, baseURL }) => {
  const routes = await projectRedirects();
  await page.route('**/lwh/**', async route => {
    const file = new URL(route.request().url()).pathname.replace('/lwh/', '').replace(/\/$/, '/index.html') || 'index.html';
    await route.fulfill({ contentType: 'text/html', body: redirectDocument(new URL(routes[file], baseURL).href) });
  });
  for (const [file, target] of Object.entries(routes)) {
    await page.goto('/lwh/' + file);
    await expect(page).toHaveURL(new URL(target as string, baseURL).href);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  await page.goto('/lwh/blog.html?via=shared#notes');
  await expect(page).toHaveURL(new URL('blog.html?via=shared#notes', baseURL).href);
  await expect(page.getByRole('heading', { name: 'Notes & essays', exact: true })).toBeInViewport();
  await page.goto('/lwh/blog.html#projects');
  await expect(page).toHaveURL(new URL('projects.html', baseURL).href);
});

test('a former article link still redirects and remains readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const target = new URL('sci-industrialist/abundance/', baseURL).href;
  await page.route('**/lwh/sci-industrialist/abundance/', route => route.fulfill({ contentType: 'text/html', body: redirectDocument(target) }));
  await page.goto(new URL('lwh/sci-industrialist/abundance/', baseURL).href);
  await expect(page).toHaveURL(target);
  await expect(page.locator('[data-article-body]')).toBeVisible();
  await context.close();
});
