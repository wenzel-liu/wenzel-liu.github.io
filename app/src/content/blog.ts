import { articleIndex } from './article-index';
import { collections, type CollectionId } from './collections';
import { siteHref } from '@/lib/nav';

export const blogIntro = {
  kicker: 'Essays & daily life',
  title: 'Blogs',
  description: 'Writing on biopharma, industry, and the ideas and experiences that shape everyday life.'
};

function getBlogCollection(id: CollectionId) {
  return {
    ...collections[id],
    id,
    url: siteHref(collections[id].path),
    articles: articleIndex.filter(article => article.collection === id)
  };
}

export const blogCollections = (['medprism', 'sci-industrialist'] as const).map(getBlogCollection);
export const notesCollection = getBlogCollection('notes');

export type BlogCollection = (typeof blogCollections)[number];
export { personalNotes as recentNotes } from './article-index';
