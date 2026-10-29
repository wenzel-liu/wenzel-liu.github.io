import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteShell } from '@/components/SiteShell';
import { Tags } from '@/components/PortfolioParts';
import { collections, type CollectionId } from '@/content/collections';
import { siteHref } from '@/lib/nav';

export interface Article {
  title: string;
  slug: string;
  path: string;
  collection: CollectionId;
  date: string;
  updated?: string;
  lang: string;
  category: string;
  description: string;
  tags: string[];
  license?: string;
  html: string;
  headings: { id: string; title: string }[];
}

function ArticleList({ articles }: { articles: Article[] }) {
  return <div className="portfolio-note-list">{articles.map((article, index) => (
    <a className="portfolio-note-row portfolio-library-row" href={siteHref(article.path)} key={article.path} lang={article.lang}>
      <span className="portfolio-note-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <p className="portfolio-article-meta"><time dateTime={article.date}>{article.date}</time><span>{article.category}</span></p>
        <h3>{article.title}</h3><p>{article.description}</p>
      </div>
      <span className="portfolio-note-action">Read article <span aria-hidden="true">↗</span></span>
    </a>
  ))}</div>;
}

export function renderCollection(id: CollectionId, articles: Article[]) {
  const collection = collections[id];
  const categories = [...new Set(articles.map((article) => article.category))];
  return renderToStaticMarkup(<ThemeProvider><SiteShell currentPath={siteHref(collection.path)}>
    <div className="portfolio-page portfolio-library">
      <a href={siteHref('blog.html#collections')} className="portfolio-text-link portfolio-library-back">← Blogs</a>
      <header className="portfolio-collection-intro">
        <p className="portfolio-kicker">{collection.kicker}</p>
        <h1>{collection.title}</h1>
        <p className="portfolio-collection-subtitle"><em>{collection.subtitle}</em></p>
        <p className="portfolio-page-description">{collection.description}</p>
      </header>
      <section aria-labelledby="library-title" className="portfolio-collection-body">
        <aside className="portfolio-library-aside">
          <p className="portfolio-kicker">The collection</p>
          <h2 id="library-title">Articles & notes</h2>
          <p>{articles.length} articles</p>
          <Tags items={categories} label="Topics in this collection" />
          <a className="portfolio-text-link" href={siteHref(id === 'medprism' ? 'sci-industrialist/' : 'medprism/')}>{id === 'medprism' ? 'Sci-Industrialist' : 'MedPrism'} ↗</a>
        </aside>
        <ArticleList articles={articles} />
      </section>
    </div>
  </SiteShell></ThemeProvider>);
}

export function renderArticle(article: Article, related: Article[]) {
  const collection = collections[article.collection];
  return renderToStaticMarkup(<ThemeProvider><SiteShell currentPath={siteHref(article.path)}>
    <article className="portfolio-article" lang={article.lang}>
      <header className="portfolio-article-header">
        <a className="portfolio-text-link" href={siteHref(collection.path)}>← {collection.title}</a>
        <p className="portfolio-kicker"><time dateTime={article.date}>{article.date}</time><span>{article.category}</span>{article.updated && article.updated !== article.date ? <span>Updated {article.updated}</span> : null}</p>
        <h1>{article.title}</h1>
        <Tags items={article.tags} label={article.lang === 'en' ? 'Article topics' : '文章标签'} />
      </header>
      <div className="portfolio-article-layout">
        <aside className="portfolio-toc">
          <details open data-article-toc><summary>{article.lang === 'en' ? 'Contents' : '文章目录'}</summary>
            <nav aria-label={article.lang === 'en' ? 'Contents' : '文章目录'}>{article.headings.map((heading) => <a key={heading.id} href={'#' + heading.id}>{heading.title}</a>)}</nav>
          </details>
        </aside>
        <div className="portfolio-prose">
          <div data-article-body dangerouslySetInnerHTML={{ __html: article.html }} />
          <footer className="portfolio-article-end">
            <p>{article.lang === 'en' ? 'Written' : '写于'} <time dateTime={article.date}>{article.date}</time>{article.updated && article.updated !== article.date ? ` · ${article.lang === 'en' ? 'Updated' : '更新于'} ${article.updated}` : ''}</p>
            {article.license ? <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank" rel="noopener noreferrer">{article.license}</a> : null}
            <a className="portfolio-text-link" href={siteHref(collection.path)}>← {collection.title}</a>
          </footer>
        </div>
      </div>
      {related.length ? <section className="portfolio-related"><h2>{article.lang === 'en' ? 'Continue reading' : '继续阅读'}</h2><div className="portfolio-related-links">{related.slice(0,2).map(item => <a href={siteHref(item.path)} key={item.path}>{item.title} ↗</a>)}</div></section> : null}
    </article>
  </SiteShell></ThemeProvider>);
}

export { collections };
