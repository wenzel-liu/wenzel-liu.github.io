export interface SearchTarget {
  id: string;
  title: string;
  text: string;
}

export interface SearchDocument {
  title: string;
  path: string;
  kind: 'page' | 'collection' | 'article';
  collection?: string;
  collectionTitle?: string;
  date?: string;
  description: string;
  tags: string[];
  text: string;
  anchor?: string;
  targets?: SearchTarget[];
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  excerpt: string;
  anchor?: string;
}

export function normalizeSearch(text: string): string {
  return text.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function searchTerms(query: string): string[] {
  return [...new Set(normalizeSearch(query.slice(0, 160)).split(' ').filter(Boolean))];
}

function targetFor(document: SearchDocument, terms: string[]): SearchTarget | undefined {
  // A query for the collection itself should still open its introduction.
  if (terms.every(term => normalizeSearch(document.title).includes(term))) return;
  return (document.targets || []).map(target => {
    const title = normalizeSearch(target.title);
    const text = normalizeSearch(target.text);
    const score = terms.every(term => title.includes(term) || text.includes(term))
      ? terms.reduce((total, term) => total + (title.includes(term) ? 10 : 1), 0) : 0;
    return { target, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score)[0]?.target;
}

function excerptFor(document: SearchDocument, terms: string[]): string {
  const description = normalizeSearch(document.description);
  const source = terms.every(term => description.includes(term)) ? document.description : document.text || document.description;
  const normalized = normalizeSearch(source);
  const positions = terms.map(term => normalized.indexOf(term)).filter(position => position >= 0);
  const match = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, match - 42);
  const end = Math.min(source.length, start + 170);
  return `${start ? '…' : ''}${source.slice(start, end).trim()}${end < source.length ? '…' : ''}`;
}

export function searchDocuments(documents: SearchDocument[], query: string, collection?: string): SearchResult[] {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  const phrase = normalizeSearch(query);
  return documents.flatMap(document => {
    if (collection && (document.kind !== 'article' || document.collection !== collection)) return [];
    const fields = [document.title, document.tags.join(' '), document.description, document.text].map(normalizeSearch);
    if (!terms.every(term => fields.some(field => field.includes(term)))) return [];
    const weights = [100, 50, 25, 5];
    const score = terms.reduce((total, term) => total + weights[fields.findIndex(field => field.includes(term))], 0)
      + (fields[0] === phrase ? 300 : fields[0].includes(phrase) ? 80 : 0);
    const target = targetFor(document, terms);
    return [{ document, score, anchor: target?.id || document.anchor,
      excerpt: excerptFor(target ? { ...document, description: target.text, text: target.text } : document, terms) }];
  }).sort((a, b) => b.score - a.score || (b.document.date || '').localeCompare(a.document.date || '') || a.document.path.localeCompare(b.document.path));
}
