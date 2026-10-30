import { JSDOM } from 'jsdom';

export function searchableText(html) {
  const fragment = JSDOM.fragment(html);
  fragment.querySelectorAll('script, style, nav, form, [aria-hidden="true"], .katex-mathml, .portfolio-note-action').forEach(node => node.remove());
  fragment.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, div, section, article, br, tr, td, th, time').forEach(node => node.append(' '));
  return fragment.textContent.replace(/\s+/g, ' ').trim();
}

export function searchTargets(html) {
  const fragment = JSDOM.fragment(html);
  return [...fragment.querySelectorAll('[data-search-target][id]')].map(node => ({
    id: node.id, title: node.getAttribute('data-search-title') || node.textContent,
    text: searchableText(node.outerHTML)
  }));
}

export function createSearchIndex(articles, collections, pages, collectionPages = {}) {
  const pageDocuments = pages.map(page => {
    const fragment = JSDOM.fragment(page.html);
    return {
      path: page.path, title: page.title, kind: 'page',
      description: fragment.querySelector('.portfolio-page-description, .portfolio-intro')?.textContent || '',
      tags: [...fragment.querySelectorAll('h2, h3, h4')].map(node => node.textContent),
      text: searchableText(page.html), targets: searchTargets(page.html)
    };
  });
  const collectionDocuments = Object.entries(collections).map(([id, collection]) => ({
    title: collection.title, path: collection.path + 'index.html', kind: 'collection',
    description: collection.description, tags: collection.tags,
    text: [collection.subtitle, collection.description, ...articles.filter(article => article.collection === id).map(article => article.title)].join(' '),
    targets: searchTargets(collectionPages[id] || '')
  }));
  const articleDocuments = articles.map(article => ({
    title: article.title, path: article.path, kind: 'article',
    collection: article.collection, collectionTitle: collections[article.collection].title,
    date: article.date, description: article.description, tags: [...article.tags, article.category],
    text: searchableText(article.html), anchor: 'article-title'
  }));
  return [...pageDocuments, ...collectionDocuments, ...articleDocuments];
}
