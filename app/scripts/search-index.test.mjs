import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSearchIndex, searchableText, searchTargets } from './search-index.mjs';

test('index text preserves paragraphs and inline text but excludes controls and executable markup', () => {
  const text = searchableText('<h2>Clinical <em>research</em></h2><p>First paragraph.</p><p>Second &amp; third.</p><nav>Menu</nav><form>Search</form><script>secret()</script><style>body{}</style><span aria-hidden="true">Decoration</span>');
  assert.equal(text, 'Clinical research First paragraph. Second & third.');
});

test('only explicit public article fields enter the index', () => {
  const articles = [{ title: 'Example', path: 'notes/example/index.html', collection: 'notes', date: '2026-10-01',
    description: 'Intro', tags: ['Learning'], category: 'Life', html: '<p>Public article body.</p>',
    source_id: 'private-source-id', sourcePath: '/private/local/file', headings: [] }];
  const collections = { notes: { title: 'Notes & essays', path: 'notes/', subtitle: '', description: 'Personal writing', tags: ['Life'] } };
  const pages = [{ title: 'Bio', path: 'index.html', html: '<p class="portfolio-intro">Introduction.</p><h2>Work</h2><p>Project content.</p>' }];
  const index = createSearchIndex(articles, collections, pages);
  assert.deepEqual(index.map(item => item.kind), ['page', 'collection', 'article']);
  assert.equal(index[0].description, 'Introduction.');
  assert.equal(index[2].text, 'Public article body.');
  assert.equal(index[2].collectionTitle, 'Notes & essays');
  assert.ok(!JSON.stringify(index).includes('private'));
  assert.ok(!JSON.stringify(index).includes('<p>'));
});

test('search destinations come from rendered article entries and keep their matching text', () => {
  const html = '<h1>MedPrism</h1><a id="article-medprism-lilly" data-search-target data-search-title="礼来全球研发重点"><time>2025-06-16</time><h3>礼来全球研发重点</h3><p>临床研究布局。</p></a><a href="elsewhere">Other page</a>';
  assert.deepEqual(searchTargets(html), [{ id: 'article-medprism-lilly', title: '礼来全球研发重点', text: '2025-06-16 礼来全球研发重点 临床研究布局。' }]);
  const index = createSearchIndex([], { medprism: { title: 'MedPrism', path: 'medprism/', subtitle: '', description: '', tags: [] } },
    [{ title: 'Blogs', path: 'blog.html', html }], { medprism: html });
  assert.deepEqual(index[0].targets, index[1].targets);
});
