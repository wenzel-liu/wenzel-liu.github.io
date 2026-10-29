import { expect, test } from '@playwright/test';
import { articleIndex } from '../src/content/article-index';

test('writing cards use local collections with italic subtitles', async ({ page }) => {
  for (const file of ['index.html', 'blog.html']) {
    await page.goto(file);
    for (const [title, subtitle, route] of [
      ['MedPrism', 'Biopharma Insight', 'medprism/'],
      ['Sci-Industrialist', 'Technology, Manufacturing & Historical Materialism', 'sci-industrialist/']
    ]) {
      const card = page.locator('.portfolio-collection-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
      await expect(card.locator('em')).toHaveText(subtitle);
      await expect(card.getByRole('link', { name: title, exact: true })).toHaveAttribute('href', '/' + route);
      await expect(card.getByRole('link', { name: title, exact: true })).not.toHaveAttribute('target', '_blank');
    }
  }
  await page.getByRole('link', { name: 'View all Sci-Industrialist articles' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sci-Industrialist');
  await expect(page.locator('.portfolio-note-row')).toHaveCount(5);
  await page.getByRole('link', { name: 'MedPrism ↗', exact: true }).click();
  await expect(page.locator('.portfolio-note-row')).toHaveCount(3);
});

for (const article of articleIndex) {
  test(`static reading, assets and small-screen layout: ${article.slug}`, async ({ page }) => {
    const failures: string[] = [];
    const scripts: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()); });
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(article.path);
    const html = await response!.text();
    expect(html).toContain('data-article-body');
    expect(html).toContain(article.title.replaceAll('&', '&amp;'));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(article.title);
    expect(await page.locator('[data-article-body]').innerText()).not.toBe('');
    expect(scripts.some(url => /renderPage-|note-/.test(url))).toBe(false);
    expect(scripts.some(url => /notion|katex/.test(url))).toBe(false);
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.locator('[data-article-toc] summary').click();
    const contentsLink = page.locator('[data-article-toc] nav a').first();
    if (await contentsLink.count()) {
      const target = await contentsLink.getAttribute('href');
      await contentsLink.click();
      await expect(page.locator(target!)).toBeInViewport();
    }
    await page.getByRole('button', { name: 'Theme options' }).click();
    await page.getByRole('menuitem', { name: 'Dark', exact: true }).click();
    await expect(page.locator('.fds-app-shell')).toHaveCSS('background-color', 'rgb(17, 30, 32)');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark');
    expect(failures).toEqual([]);
  });
}

test('article bodies and collection links are readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const article of articleIndex) {
    await page.goto('http://127.0.0.1:4173/' + article.path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(article.title);
    await expect(page.locator('[data-article-body]')).toBeVisible();
  }
  await context.close();
});

test('equations, tables and imported image render from local assets', async ({ page }) => {
  await page.goto('sci-industrialist/talent-attraction-score/');
  expect(await page.locator('.katex').count()).toBeGreaterThan(2);
  await expect(page.locator('.katex-error')).toHaveCount(0);
  expect(await page.locator('[data-article-body]').innerText()).not.toMatch(/\$A_|BcoreB_|AboostA_/);
  await page.setViewportSize({ width: 390, height: 844 });
  const table = page.locator('.portfolio-table-scroll').first();
  expect(await table.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
  await page.goto('sci-industrialist/abundance/');
  const cover = page.getByRole('img', { name: 'Abundance 书籍封面' });
  await cover.scrollIntoViewIfNeeded();
  await expect.poll(() => cover.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(cover).toHaveAttribute('src', /\/assets\/articles\/abundance-cover\.png$/);
});

test('mobile menu and theme persist between static and React pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('medprism/');
  await page.getByRole('button', { name: 'Theme options' }).click();
  await page.getByRole('menuitem', { name: 'Dark', exact: true }).click();
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  await toggle.click();
  const menu = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(menu).toBeHidden();
  await toggle.click();
  await menu.getByRole('link', { name: 'Blogs', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark');
  await expect(page.locator('#notes .portfolio-note-row')).toHaveCount(2);
});
