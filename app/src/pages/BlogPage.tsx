import { useEffect } from 'react';
import { PageIntro } from '@/components/PageIntro';
import { BlogCollectionCard } from '@/components/BlogCollectionCard';
import { blogCollections, blogIntro, notesCollection } from '@/content/blog';
import { siteHref } from '@/lib/nav';

export function BlogPage() {
  useEffect(() => {
    if (window.location.hash === '#projects') window.location.replace(siteHref('projects.html'));
  }, []);

  return (
    <div className="portfolio-page portfolio-blog">
      <PageIntro {...blogIntro}>
        <nav className="portfolio-page-index" aria-label="On this page">
          <a href="#collections"><span>Essay collections</span><span>2 collections ↘</span></a>
          <a href="#notes"><span>Daily notes</span><span>{notesCollection.articles.length} articles ↘</span></a>
        </nav>
      </PageIntro>

      <section id="collections" className="portfolio-blog-collections" aria-label="Essay collections">
        {blogCollections.map(collection => <BlogCollectionCard key={collection.id} collection={collection} />)}
      </section>

      <section id="notes" className="portfolio-notes-collection" aria-label="Daily notes">
        <BlogCollectionCard collection={notesCollection} />
      </section>
    </div>
  );
}
