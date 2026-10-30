import { expect, test } from '@playwright/test';

for (const start of ['/index.html', '/blog.html', '/medprism/']) {
  test(`clicking a global search result on ${start} opens the article`, async ({ page }) => {
    await page.goto(start);
    await page.getByRole('searchbox', { name: 'Search the site', exact: true }).fill('礼来');
    const results = page.getByRole('region', { name: 'Site search results', exact: true });
    await expect(results.getByRole('link').first()).toContainText('礼来公司');
    await results.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/medprism\/lilly-research-pipeline\/index\.html#article-title$/);
    await expect(page.locator('[data-article-body]')).toBeVisible();
  });
}

test('tapping a global result on a touch screen opens its article', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto(new URL('/index.html', baseURL).href);
  await page.getByRole('searchbox', { name: 'Search the site', exact: true }).fill('Novartis');
  const result = page.getByRole('region', { name: 'Site search results', exact: true }).getByRole('link').first();
  await expect(result).toContainText('Novartis R&D');
  await result.tap();
  await expect(page).toHaveURL(/\/medprism\/novartis-research-overview\/index\.html#article-title$/);
  await expect(page.locator('[data-article-body]')).toBeVisible();
  await context.close();
});

test('collection results remain clickable and clearing works with the mouse', async ({ page }) => {
  await page.goto('/notes/');
  const input = page.getByRole('searchbox', { name: 'Search Notes & essays articles', exact: true });
  await input.fill('口述');
  const results = page.getByRole('region', { name: 'Notes & essays search results', exact: true });
  await expect(results.getByRole('link').first()).toContainText('重新开始写日记');
  await page.getByRole('button', { name: 'Clear collection search', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(page.locator('[data-collection-list]')).toBeVisible();
  await input.fill('口述');
  await results.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/notes\/starting-a-spoken-journal\/index\.html#article-title$/);
});

test('global results close on an outside click or keyboard focus leaving the widget', async ({ page }) => {
  await page.goto('/index.html');
  const input = page.getByRole('searchbox', { name: 'Search the site', exact: true });
  const results = page.getByRole('region', { name: 'Site search results', exact: true });
  await input.fill('いろいろ勉強');
  await expect(results.getByRole('link')).toHaveCount(1);
  await page.getByRole('heading', { name: 'Wenhao Liu', exact: true }).click();
  await expect(results).toBeHidden();
  await input.click();
  await expect(results.getByRole('link')).toBeVisible();
  await input.press('ArrowDown');
  await expect(results.getByRole('link')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(results).toBeHidden();
  await input.click();
  await expect(results.getByRole('link')).toBeVisible();
  await page.getByRole('button', { name: 'Clear site search', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(results).toBeHidden();
});
