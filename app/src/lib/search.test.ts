import { describe, expect, it } from 'vitest';
import { searchDocuments, type SearchDocument } from './search';

function article(overrides: Partial<SearchDocument> = {}): SearchDocument {
  return { title: 'A note', path: 'notes/a-note/index.html', kind: 'article', collection: 'notes',
    description: 'A short introduction.', tags: [], text: 'A longer article.', date: '2026-01-01', ...overrides };
}

describe('public site search', () => {
  it('matches Chinese and Japanese body text without requiring word boundaries', () => {
    const documents = [article({ text: '今天记录心血管研究。出差后，いろいろ勉強になりました。' })];
    expect(searchDocuments(documents, '心血管')).toHaveLength(1);
    expect(searchDocuments(documents, 'いろいろ勉強')).toHaveLength(1);
    expect(searchDocuments(documents, 'unrelated')).toEqual([]);
  });

  it('normalizes Latin case and full-width characters and requires every term', () => {
    const documents = [article({ title: 'Novartis research', tags: ['Clinical'], text: 'A pipeline update.' })];
    expect(searchDocuments(documents, 'ＮＯＶＡＲＴＩＳ clinical pipeline')).toHaveLength(1);
    expect(searchDocuments(documents, 'novartis unrelated')).toEqual([]);
    expect(searchDocuments(documents, '   ')).toEqual([]);
  });

  it('ranks exact titles, title matches and tags ahead of body-only mentions', () => {
    const documents = [
      article({ path: 'body.html', text: 'This discusses Focus Reader.' }),
      article({ path: 'tag.html', tags: ['Focus Reader'] }),
      article({ path: 'title.html', title: 'Building Focus Reader' }),
      article({ path: 'exact.html', title: 'Focus Reader' })
    ];
    expect(searchDocuments(documents, 'Focus Reader').map(result => result.document.path))
      .toEqual(['exact.html', 'title.html', 'tag.html', 'body.html']);
  });

  it('uses recent dates to order equally relevant articles', () => {
    const documents = [article({ path: 'old.html' }), article({ path: 'new.html', date: '2026-10-01' })];
    expect(searchDocuments(documents, 'note')[0].document.path).toBe('new.html');
  });

  it('limits collection searches to that collection’s articles', () => {
    const documents = [article(), article({ path: 'medprism/test.html', collection: 'medprism' }),
      article({ path: 'notes/index.html', kind: 'collection' })];
    expect(searchDocuments(documents, 'note', 'notes').map(result => result.document.path))
      .toEqual(['notes/a-note/index.html']);
  });

  it('shows a bounded excerpt around a body match beyond the introduction', () => {
    const documents = [article({ text: 'Earlier context. '.repeat(100) + '心血管研究 connects these ideas. ' + 'Later context. '.repeat(100) })];
    const result = searchDocuments(documents, '心血管')[0];
    expect(result.excerpt).toContain('心血管研究');
    expect(result.excerpt.length).toBeLessThanOrEqual(172);
  });

  it('treats punctuation and markup-shaped queries as literal text', () => {
    const documents = [article({ title: 'C++ & R&D', text: 'A literal <script> example.' })];
    expect(searchDocuments(documents, 'C++')).toHaveLength(1);
    expect(searchDocuments(documents, '<script>')).toHaveLength(1);
    expect(searchDocuments(documents, '.*')).toEqual([]);
  });

  it('links page and collection hits to the matching article instead of the page introduction', () => {
    const documents = [article({ kind: 'collection', title: 'MedPrism', path: 'medprism/index.html',
      text: 'Novartis research. 礼来全球研发重点。', targets: [
        { id: 'article-novartis', title: 'Novartis research', text: 'Novartis research.' },
        { id: 'article-lilly', title: '礼来全球研发重点', text: '礼来全球研发重点。' }
      ] })];
    const result = searchDocuments(documents, '礼来')[0];
    expect(result.anchor).toBe('article-lilly');
    expect(result.excerpt).toContain('礼来');
    expect(result.excerpt).not.toContain('Novartis');
    expect(searchDocuments(documents, 'MedPrism')[0].anchor).toBeUndefined();
  });

  it('uses the article title destination for direct article results', () => {
    const result = searchDocuments([article({ anchor: 'article-title' })], 'note')[0];
    expect(result.anchor).toBe('article-title');
  });
});
