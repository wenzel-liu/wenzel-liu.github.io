import { expect, test } from '@playwright/test';

test('global search loads on demand, finds pages and body text, and supports keyboard navigation', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().includes('/search/')) requests.push(request.url()); });
  await page.goto('/');
  const input = page.getByRole('searchbox', { name: 'Search the site', exact: true });
  const results = page.getByRole('region', { name: 'Site search results', exact: true });
  await expect(input).toBeVisible();
  await input.focus();
  expect(requests).toEqual([]);
  await input.fill('ＦＯＣＵＳ Reader');
  await expect(results.getByRole('link').first()).toHaveAttribute('href', '/projects.html');
  await input.press('ArrowDown');
  await expect(results.getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(results).toBeHidden();
  await expect(input).toBeFocused();
  await input.fill('いろいろ勉強');
  const note = results.getByRole('link');
  await expect(note).toHaveCount(1);
  await expect(note).toContainText('出差回来的一句日语');
  await expect(note.locator('mark')).toContainText('いろいろ勉強');
  expect(requests.map(url => new URL(url).pathname)).toEqual(['/search/index.json']);
  await input.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/notes\/a-phrase-after-a-business-trip\/index\.html#article-title$/);
  await expect(page.locator('[data-article-body]')).toBeVisible();
});

for (const collection of [
  { path: 'medprism', title: 'MedPrism', query: '礼来', count: 3 },
  { path: 'sci-industrialist', title: 'Sci-Industrialist', query: 'American Factory', count: 6 },
  { path: 'notes', title: 'Notes & essays', query: '口述', count: 5 }
]) {
  test(`${collection.title} searches only its own articles and restores the full list`, async ({ page }) => {
    const requests: string[] = [];
    page.on('request', request => { if (request.url().includes('/search/')) requests.push(request.url()); });
    await page.goto(`/${collection.path}/`);
    const input = page.getByRole('searchbox', { name: `Search ${collection.title} articles`, exact: true });
    const results = page.getByRole('region', { name: `${collection.title} search results`, exact: true });
    const original = page.locator('[data-collection-list]');
    await expect(original.locator('h3')).toHaveCount(collection.count);
    await expect(input).toBeVisible();
    expect(requests).toEqual([]);
    await input.fill(collection.query);
    await expect(results.getByRole('status')).toContainText(`in ${collection.title}`);
    await expect(results.getByRole('link').first()).toBeVisible();
    await expect(original).toBeHidden();
    const hrefs = await results.getByRole('link').evaluateAll(links => links.map(link => link.getAttribute('href')));
    expect(hrefs.every(href => href?.startsWith(`/${collection.path}/`) || (collection.path === 'medprism' && href?.startsWith('/posts/')))).toBe(true);
    await input.fill('no-such-article-12345');
    await expect(results.getByRole('status')).toContainText('No results');
    await expect(results.getByRole('link')).toHaveCount(0);
    await page.getByRole('button', { name: 'Clear collection search' }).click();
    await expect(input).toHaveValue('');
    await expect(original).toBeVisible();
    await expect(results).toBeHidden();
    expect(requests.map(url => new URL(url).pathname)).toEqual([`/search/${collection.path}.json`]);
  });
}

test('a failed collection index keeps articles readable and can be retried', async ({ page }) => {
  let attempts = 0;
  await page.route('**/search/medprism.json', async route => {
    if (++attempts === 1) await route.fulfill({ status: 503, body: 'Unavailable' });
    else await route.continue();
  });
  await page.goto('/medprism/');
  await page.getByRole('searchbox', { name: 'Search MedPrism articles' }).fill('Novartis');
  await expect(page.getByText('Search could not load. Please try again.')).toBeVisible();
  await expect(page.locator('[data-collection-list]')).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  const results = page.getByRole('region', { name: 'MedPrism search results' });
  await expect(results.getByRole('link').first()).toContainText('Novartis');
  await expect(page.locator('[data-collection-list]')).toBeHidden();
  expect(attempts).toBe(2);
});

test('clearing a search while its index is loading does not restore stale results', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/search/index.json', async route => { await pending; await route.continue(); });
  await page.goto('/blog.html');
  const input = page.getByRole('searchbox', { name: 'Search the site', exact: true });
  const request = page.waitForRequest('**/search/index.json');
  await input.fill('Novartis');
  await request;
  await page.getByRole('button', { name: 'Clear site search' }).click();
  const response = page.waitForResponse('**/search/index.json');
  release();
  await response;
  await expect(page.getByRole('region', { name: 'Site search results' })).toBeHidden();
  await expect(input).toHaveValue('');
  await input.fill('Focus Reader');
  await expect(page.getByRole('region', { name: 'Site search results' }).getByRole('link').first()).toHaveAttribute('href', '/projects.html');
});

test('IME composition waits for the completed query and handles markup as text', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => { if (request.url().includes('/search/')) requests.push(request.url()); });
  await page.goto('/blog.html');
  const input = page.getByRole('searchbox', { name: 'Search the site', exact: true });
  await input.focus();
  await input.dispatchEvent('compositionstart');
  await input.fill('礼来');
  await input.press('Enter');
  await page.waitForTimeout(220); // Longer than debounce: a partial IME query must not fetch.
  expect(requests).toEqual([]);
  await input.dispatchEvent('compositionend');
  const results = page.getByRole('region', { name: 'Site search results' });
  await expect(results.getByRole('link').first()).toContainText('礼来');
  await input.fill('<img src=x onerror=alert(1)>');
  await expect(results.getByRole('status')).toContainText('No results');
  await expect(results.locator('img, script')).toHaveCount(0);
});

test('search remains usable on a narrow dark article page without obscuring navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/notes/a-phrase-after-a-business-trip/');
  await page.getByRole('button', { name: 'Theme options' }).click();
  await page.getByRole('menuitem', { name: 'Dark', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search the site', exact: true }).fill('Novartis');
  const results = page.getByRole('region', { name: 'Site search results' });
  await expect(results.getByRole('link').first()).toBeVisible();
  await expect(results).toHaveCSS('background-color', 'rgb(17, 30, 32)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const box = await results.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await expect(results).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
});

test('all generated search destinations exist and collection indexes are isolated', async ({ request }) => {
  const index = await (await request.get('/search/index.json')).json();
  expect(index).toHaveLength(22);
  expect(new Set(index.map((item: { path: string }) => item.path)).size).toBe(index.length);
  for (const item of index) {
    expect((await request.get('/' + item.path)).ok()).toBe(true);
    expect(item).not.toHaveProperty('source_id');
    expect(item).not.toHaveProperty('html');
  }
  for (const collection of ['medprism', 'sci-industrialist', 'notes']) {
    const scoped = await (await request.get(`/search/${collection}.json`)).json();
    expect(scoped).toEqual(index.filter((item: { kind: string; collection: string }) => item.kind === 'article' && item.collection === collection));
  }
});

test('without JavaScript, collection articles remain readable and inactive search controls are hidden', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(new URL('/notes/', baseURL).href);
  await expect(page.locator('[data-collection-list] h3')).toHaveCount(5);
  await expect(page.locator('[data-collection-list]')).toBeVisible();
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await page.locator('[data-collection-list] a').first().click();
  await expect(page.locator('[data-article-body]')).toBeVisible();
  await context.close();
});
