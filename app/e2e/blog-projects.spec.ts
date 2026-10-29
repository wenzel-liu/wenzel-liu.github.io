import { expect, test } from '@playwright/test';

test('Blogs and Projects have separate navigation and content', async ({ page }) => {
  await page.goto('blog.html');
  const navigation = page.getByRole('navigation', { name: 'Primary', exact: true });
  await expect(navigation.getByRole('link')).toHaveText(['Bio', 'Blogs', 'Projects', 'Experience', 'Papers & Talks']);
  await expect(navigation.getByRole('link', { name: 'Blogs', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('main').getByRole('heading', { name: 'Focus Reader', exact: true })).toHaveCount(0);
  const collections = page.locator('#collections');
  const notes = page.locator('#notes');
  await expect(collections.getByRole('heading', { level: 2 })).toHaveCount(2);
  await expect(collections.getByRole('heading', { name: 'MedPrism', exact: true })).toBeVisible();
  await expect(collections.getByRole('heading', { name: 'Sci-Industrialist', exact: true })).toBeVisible();
  await expect(notes.locator('.portfolio-note-row')).toHaveCount(2);
  expect((await collections.boundingBox())!.y).toBeLessThan((await notes.boundingBox())!.y);

  await navigation.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\.html$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
  await expect(navigation.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: 'Focus Reader', exact: true })).toBeVisible();
  await expect(page.getByRole('main').getByRole('heading', { name: /MedPrism|Sci-Industrialist/ })).toHaveCount(0);
  const emphasis = page.getByRole('button', { name: 'Word emphasis' });
  await emphasis.click();
  await expect(emphasis).toHaveAttribute('aria-pressed', 'false');
});

test('Blogs article links open the article directly and return to its collection', async ({ page }) => {
  await page.goto('blog.html');
  const article = page.getByRole('list', { name: 'MedPrism recent articles' }).getByRole('link').first();
  const title = await article.locator('span').innerText();
  await article.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(page.locator('[data-article-body]')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('link', { name: 'Blogs', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: '← MedPrism', exact: true }).first().click();
  await page.getByRole('link', { name: '← Blogs', exact: true }).click();
  await expect(page).toHaveURL(/blog\.html#collections$/);
  await expect(page.getByRole('heading', { name: 'MedPrism', exact: true })).toBeInViewport();
});

test('the old Blogs projects fragment opens the dedicated Projects page', async ({ page }) => {
  await page.goto('blog.html#projects');
  await expect(page).toHaveURL(/\/projects\.html$/);
  await expect(page.getByRole('heading', { name: 'Focus Reader', exact: true })).toBeVisible();
});

test('mobile article navigation can open Projects and retains the theme', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('sci-industrialist/talent-attraction-score/');
  await page.getByRole('button', { name: 'Theme options' }).click();
  await page.getByRole('menuitem', { name: 'Dark', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\.html$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
