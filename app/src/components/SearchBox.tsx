import { useEffect, useRef } from 'react';
import { FluentIcon } from './FluentIcon';
import { siteHref } from '@/lib/nav';
import { initializeSearch } from '@/lib/search-ui';

export function SearchBox({ collection, title }: { collection?: string; title?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const id = collection ? `search-${collection}` : 'site-search';
  const label = collection ? `Search ${title} articles` : 'Search the site';
  useEffect(() => initializeSearch(root.current!), []);
  return (
    <div ref={root} hidden className={`site-search${collection ? ' site-search--collection' : ' site-search--global'}`}
      data-search-widget data-collection={collection} data-collection-title={title}
      data-index-url={siteHref(`search/${collection || 'index'}.json`)}>
      <form role="search" aria-label={collection ? `${title} articles` : 'Site search'}>
        <label className={collection ? 'site-search-label' : 'site-search-visually-hidden'} htmlFor={id}>{label}</label>
        <div className="site-search-field">
          <FluentIcon name="search" size={17} />
          <input id={id} type="search" name="q" placeholder={collection ? `Search ${title}…` : 'Search site…'}
            autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={160}
            aria-controls={`${id}-results`} aria-describedby={collection ? `${id}-hint` : undefined} />
          <button hidden data-search-clear className="site-search-clear" type="button" aria-label={collection ? 'Clear collection search' : 'Clear site search'}>Clear</button>
        </div>
        {collection ? <p id={`${id}-hint`} className="site-search-hint">Search titles, tags and article text.</p> : null}
      </form>
      <section id={`${id}-results`} className="site-search-results" data-search-results hidden aria-label={collection ? `${title} search results` : 'Site search results'}>
        <p className="site-search-status" role="status" aria-live="polite" data-search-status />
        <button className="site-search-retry" type="button" data-search-retry hidden>Try again</button>
        <ol data-search-list />
      </section>
    </div>
  );
}
