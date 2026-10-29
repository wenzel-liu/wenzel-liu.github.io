import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const pages = [
  { file: 'index.html', title: /Bio \| Wenhao Liu/i },
  { file: 'blog.html', title: /Blog \| Wenhao Liu/i },
  { file: 'projects.html', title: /Projects \| Wenhao Liu/i },
  { file: 'experience.html', title: /Experience \| Wenhao Liu/i },
  { file: 'research.html', title: /Papers & Talks \| Wenhao Liu/i },
  { file: 'posts/academic-life-in-tokyo.html', title: /东京学术生活/ },
  { file: 'posts/rna-metabolism-heart-disease.html', title: /RNA代谢/ },
  { file: 'posts/welcome-to-my-blog.html', title: /欢迎来到我的博客/ }
];

test.describe('site smoke checks', () => {
  for (const pageMeta of pages) {
    test(`loads ${pageMeta.file}`, async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error') {
          errors.push(message.text());
        }
      });

      await page.goto(pageMeta.file);
      await expect(page).toHaveTitle(pageMeta.title);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('a[href="#"]')).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }

  test('theme preference persists after reload', async ({ page }) => {
    await page.goto('index.html');
    await page.getByRole('button', { name: 'Theme options' }).click();
    await page.getByRole('menuitem', { name: 'Dark' }).click();
    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark');
  });
});

test.describe('work-first homepage', () => {
  test('work shortcut reaches the showcase and emphasis changes the preview, not its text', async ({ page }) => {
    await page.goto('index.html');
    await page.getByRole('link', { name: 'Explore my work' }).click();
    await expect(page).toHaveURL(/#work$/);
    await expect(page.getByRole('heading', { name: 'Selected work' })).toBeInViewport();

    const sample = page.locator('#reading-sample');
    const text = await sample.textContent();
    const firstWord = sample.locator('strong').first();
    const emphasizedWeight = await firstWord.evaluate((node) => Number(getComputedStyle(node).fontWeight));
    const toggle = page.getByRole('button', { name: 'Word emphasis' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const plainWeight = await firstWord.evaluate((node) => Number(getComputedStyle(node).fontWeight));
    expect(emphasizedWeight).toBeGreaterThan(plainWeight);
    expect(await sample.textContent()).toBe(text);
    await toggle.click();
    await expect(firstWord).toHaveCSS('font-weight', String(emphasizedWeight));
  });

  for (const width of [390, 768, 940]) {
    test(`navigation and content fit a ${width}px viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('index.html');
      const toggle = page.getByRole('button', { name: 'Toggle navigation' });
      await toggle.click();
      const menu = page.getByRole('navigation', { name: 'Mobile navigation' });
      await expect(menu).toBeVisible();
      await page.setViewportSize({ width: width + 5, height: 844 });
      await expect(menu).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(toggle).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await toggle.click();
      await menu.getByRole('link', { name: 'Experience' }).click();
      await expect(page).toHaveTitle(/Experience/);
    });
  }

  test('keyboard users can skip directly to the content', async ({ page }) => {
    await page.goto('index.html');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });

  test('portrait and CV are available in the production preview', async ({ page }) => {
    await page.goto('index.html');
    const portrait = page.getByRole('img', { name: 'Portrait of Wenhao Liu' });
    await expect(portrait).toBeVisible();
    expect(await portrait.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const href = await page.getByRole('link', { name: 'Curriculum Vitae', exact: true }).getAttribute('href');
    const response = await page.request.get(href!);
    expect(response.ok()).toBe(true);
    expect((await response.body()).subarray(0, 4).toString()).toBe('%PDF');
  });
});

// Every public page must retain the same navigation, responsive shell and theme.
test.describe('unified site', () => {
  for (const pageMeta of pages) {
    test(`layout and theme work on ${pageMeta.file}`, async ({ page }) => {
      await page.goto(pageMeta.file);
      await page.getByRole('button', { name: 'Theme options' }).click();
      await page.getByRole('menuitem', { name: 'Light', exact: true }).click();
      const shell = page.locator('.fds-app-shell');
      const light = await shell.evaluate((node) => getComputedStyle(node).backgroundColor);
      expect(light).toBe('rgb(246, 245, 240)');
      for (const width of [390, 768, 940, 981, 1024, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }
      await page.getByRole('button', { name: 'Theme options' }).click();
      await page.getByRole('menuitem', { name: 'Dark', exact: true }).click();
      await expect(shell).toHaveCSS('background-color', 'rgb(17, 30, 32)');
      await page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('link', { name: 'Experience', exact: true }).click();
      await expect(page).toHaveURL(/\/experience\.html$/);
      await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark');
    });
  }

  for (const note of pages.filter((item) => item.file.startsWith('posts/'))) {
    test(`article navigation works for ${note.file}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(note.file.includes('rna-metabolism') ? 'medprism/' : 'blog.html');
      await page.locator('a[href="/' + note.file + '"]').click();
      await expect(page).toHaveTitle(note.title);
      await page.locator('[data-article-toc] summary').click();
      await page.getByRole('navigation', { name: '文章目录' }).getByRole('link').first().click();
      await expect(page.locator('#section-1')).toBeInViewport();
      await page.getByRole('button', { name: 'Toggle navigation' }).click();
      const mobile = page.getByRole('navigation', { name: 'Mobile navigation' });
      await expect(mobile.getByRole('link', { name: 'Blog', exact: true })).toHaveAttribute('aria-current', 'page');
      await mobile.getByRole('link', { name: 'Bio', exact: true }).click();
      await expect(page).toHaveURL(/\/index\.html$/);
    });
  }

  test('all legacy URLs forward to a current page and section', async ({ page }) => {
    const routes: Record<string, string> = JSON.parse(readFileSync(new URL('../legacy-routes.json', import.meta.url), 'utf8'));
    for (const [from, to] of Object.entries(routes)) {
      await page.goto(from);
      await expect(page).toHaveURL(new URL('/' + to, page.url()).href);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const hash = to.split('#')[1];
      if (hash) await expect(page.locator('#' + hash)).toBeInViewport();
    }
  });
});
