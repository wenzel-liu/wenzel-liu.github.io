import type { BlogCollection } from '@/content/blog';
import { siteHref } from '@/lib/nav';

export function BlogCollectionCard({ collection, compact = false }: { collection: BlogCollection; compact?: boolean }) {
  const Heading = compact ? 'h3' : 'h2';
  return (
    <article className="portfolio-collection-card" aria-labelledby={`collection-${collection.id}`}>
      <Heading id={`collection-${collection.id}`}>
        <a href={collection.url}>{collection.title}<span aria-hidden="true">↗</span></a>
      </Heading>
      {collection.subtitle ? <p className="portfolio-collection-card-subtitle"><em>{collection.subtitle}</em></p> : null}
      <p className="portfolio-collection-card-description">{collection.description}</p>
      {!compact ? (
        <ul className="portfolio-collection-latest" aria-label={`${collection.title} recent articles`}>
          {collection.articles.slice(0, 3).map(article => (
            <li key={article.path}>
              <a href={siteHref(article.path)} lang={article.lang}
                id={`article-${article.collection}-${article.slug}`} data-search-target data-search-title={article.title}>
                <time dateTime={article.date}>{article.date}</time><span>{article.title}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <a className="portfolio-text-link portfolio-collection-all" href={collection.url} aria-label={`View all ${collection.title} articles`}>
        View all {collection.articles.length} articles <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}
