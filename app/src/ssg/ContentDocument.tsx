import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteShell } from '@/components/SiteShell';
import { Tags } from '@/components/PortfolioParts';
import { collections, type CollectionId } from '@/content/collections';
import { siteHref } from '@/lib/nav';
import { SearchBox } from '@/components/SearchBox';
import { BioPage } from '@/pages/BioPage';
import { BlogPage } from '@/pages/BlogPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ExperiencePage } from '@/pages/ExperiencePage';
import { ResearchPage } from '@/pages/ResearchPage';

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
  return <div className="portfolio-note-list" data-collection-list>{articles.map((article, index) => (
    <a className="portfolio-note-row portfolio-library-row" href={siteHref(article.path)} key={article.path} lang={article.lang}
      id={`article-${article.collection}-${article.slug}`} data-search-target data-search-title={article.title}>
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
  const hasMark = id === 'sci-industrialist' || id === 'medprism';
  const categories = [...new Set(articles.map((article) => article.category))];
  return renderToStaticMarkup(<ThemeProvider><SiteShell currentPath={siteHref(collection.path)}>
    <div className="portfolio-page portfolio-library">
      <a href={siteHref(id === 'notes' ? 'blog.html#notes' : 'blog.html#collections')} className="portfolio-text-link portfolio-library-back">← Blogs</a>
      <header className={`portfolio-collection-intro${hasMark ? ' portfolio-collection-intro--with-mark' : ''}`}>
        <div>
          <p className="portfolio-kicker">{collection.kicker}</p>
          <h1>{collection.title}</h1>
          {collection.subtitle ? <p className="portfolio-collection-subtitle"><em>{collection.subtitle}</em></p> : null}
          <p className="portfolio-page-description">{collection.description}</p>
        </div>
        {id === 'sci-industrialist' ? <div className="portfolio-collection-mark portfolio-collection-mark--sci-industrialist" role="img" aria-label="Sci-Industrialist logo" /> : null}
        {id === 'medprism' ? <img className="portfolio-collection-mark portfolio-collection-mark--medprism" src={siteHref('assets/images/medprism/MedPrism_logo.webp')} alt="MedPrism logo" width={1024} height={1024} decoding="async" /> : null}
      </header>
      <section aria-labelledby="library-title" className="portfolio-collection-body">
        <aside className="portfolio-library-aside">
          <p className="portfolio-kicker">The collection</p>
          <h2 id="library-title">Articles & notes</h2>
          <p>{articles.length} articles</p>
          <Tags items={categories} label="Topics in this collection" />
          <nav className="portfolio-library-links" aria-label="Other collections">
            {Object.entries(collections).filter(([otherId]) => otherId !== id).map(([otherId, other]) => (
              <a className="portfolio-text-link" href={siteHref(other.path)} key={otherId}>{other.title} ↗</a>
            ))}
          </nav>
        </aside>
        <div className="portfolio-collection-content">
          <SearchBox collection={id} title={collection.title} />
          <ArticleList articles={articles} />
        </div>
      </section>
    </div>
  </SiteShell></ThemeProvider>);
}

export function renderArticle(article: Article, related: Article[]) {
  const collection = collections[article.collection];
  const hasContents = article.headings.length > 0;
  return renderToStaticMarkup(<ThemeProvider><SiteShell currentPath={siteHref(article.path)}>
    <article className={`portfolio-article${hasContents ? '' : ' portfolio-article--short'}`} lang={article.lang}>
      <header className="portfolio-article-header">
        <a className="portfolio-text-link" href={siteHref(collection.path)}>← {collection.title}</a>
        <p className="portfolio-kicker"><time dateTime={article.date}>{article.date}</time><span>{article.category}</span>{article.updated && article.updated !== article.date ? <span>Updated {article.updated}</span> : null}</p>
        <h1 id="article-title" data-search-target tabIndex={-1}>{article.title}</h1>
        <Tags items={article.tags} label={article.lang === 'en' ? 'Article topics' : '文章标签'} />
      </header>
      <div className="portfolio-article-layout">
        {hasContents ? <aside className="portfolio-toc">
          <details open data-article-toc><summary>{article.lang === 'en' ? 'Contents' : '文章目录'}</summary>
            <nav aria-label={article.lang === 'en' ? 'Contents' : '文章目录'}>{article.headings.map((heading) => <a key={heading.id} href={'#' + heading.id}>{heading.title}</a>)}</nav>
          </details>
        </aside> : null}
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

export function renderSearchPages() {
  return [
    { path: 'index.html', title: 'Bio · Wenhao Liu', page: <BioPage /> },
    { path: 'blog.html', title: 'Blogs', page: <BlogPage /> },
    { path: 'projects.html', title: 'Projects · Focus Reader', page: <ProjectsPage /> },
    { path: 'experience.html', title: 'Experience', page: <ExperiencePage /> },
    { path: 'research.html', title: 'Papers & Talks', page: <ResearchPage /> }
  ].map(({ page, ...metadata }) => ({ ...metadata, html: renderToStaticMarkup(page) }));
}
