import { expect, test, type Page } from '@playwright/test';

async function expectAligned(page: Page, id: string) {
  const target = page.locator(`[id="${id}"]`);
  await expect(target).toBeVisible();
  await expect.poll(() => target.evaluate(element => {
    const header = document.querySelector('.fds-topbar')!.getBoundingClientRect();
    return Math.abs(element.getBoundingClientRect().top - header.bottom - 16);
  })).toBeLessThan(3);
  await expect(target).toBeFocused();
}

for (const width of [1280, 390]) {
  test(`collection and Blogs hits land at the matching article at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/index.html');
    const input = page.getByRole('searchbox', { name: 'Search the site', exact: true });
    await input.fill('礼来');
    const results = page.getByRole('region', { name: 'Site search results', exact: true });
    const collection = results.locator('a[href^="/medprism/index.html#"]');
    const id = 'article-medprism-lilly-research-pipeline';
    await expect(collection).toHaveAttribute('href', `/medprism/index.html#${id}`);
    await collection.click();
    await expectAligned(page, id);
    await page.reload();
    await expectAligned(page, id);
    await page.goBack();
    await expect(page).toHaveURL(/\/index\.html$/);
    await input.fill('礼来');
    await results.locator('a[href^="/blog.html#"]').click();
    await expect(page).toHaveURL(new RegExp(`/blog\\.html#${id}$`));
    await expectAligned(page, id);
  });
}

test('the final collection article can align at the top without changing article order', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByRole('searchbox', { name: 'Search the site', exact: true }).fill('RNA代谢');
  await page.getByRole('region', { name: 'Site search results', exact: true }).locator('a[href^="/medprism/index.html#"]').click();
  const id = 'article-medprism-rna-metabolism-heart-disease';
  await expectAligned(page, id);
  await expect(page.locator('[data-collection-list] > a').last()).toHaveAttribute('id', id);
  await page.locator(`[id="${id}"]`).click();
  await expect(page).toHaveURL(/\/posts\/rna-metabolism-heart-disease\.html$/);
  await expect(page.locator('[data-article-body]')).toBeVisible();
});

test('a result on the current collection page closes the overlay and restores a filtered list', async ({ page }) => {
  await page.goto('/medprism/index.html');
  await page.getByRole('searchbox', { name: 'Search MedPrism articles' }).fill('Novartis');
  await expect(page.locator('[data-collection-list]')).toBeHidden();
  await page.getByRole('searchbox', { name: 'Search the site', exact: true }).fill('礼来');
  const results = page.getByRole('region', { name: 'Site search results', exact: true });
  await results.locator('a[href^="/medprism/index.html#"]').click();
  await expect(results).toBeHidden();
  await expect(page.getByRole('searchbox', { name: 'Search MedPrism articles' })).toHaveValue('');
  await expectAligned(page, 'article-medprism-lilly-research-pipeline');
});

test('an article result positions its title below the fixed navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/index.html');
  await page.getByRole('searchbox', { name: 'Search the site', exact: true }).fill('出差回来的一句日语');
  await page.getByRole('region', { name: 'Site search results', exact: true }).getByRole('link').first().click();
  await expectAligned(page, 'article-title');
});

test('repeating a search for the current fragment still closes results and restores the target', async ({ page }) => {
  const id = 'article-medprism-lilly-research-pipeline';
  await page.goto(`/medprism/index.html#${id}`);
  await expectAligned(page, id);
  await page.getByRole('searchbox', { name: 'Search MedPrism articles' }).fill('Novartis');
  await expect(page.locator('[data-collection-list]')).toBeHidden();
  await page.getByRole('searchbox', { name: 'Search the site', exact: true }).fill('礼来');
  const results = page.getByRole('region', { name: 'Site search results', exact: true });
  await results.locator(`a[href="/medprism/index.html#${id}"]`).click();
  await expect(results).toBeHidden();
  await expect(page.locator('[data-collection-list]')).toBeVisible();
  await expectAligned(page, id);
});

test('every generated search anchor exists on its destination page', async ({ page, request }) => {
  const index = await (await request.get('/search/index.json')).json();
  for (const document of index) {
    const ids = [...(document.targets || []).map((target: { id: string }) => target.id), ...(document.anchor ? [document.anchor] : [])];
    if (!ids.length) continue;
    await page.goto('/' + document.path);
    for (const id of ids) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  }
});
