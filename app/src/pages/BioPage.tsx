import { ProjectCard } from '@/components/PortfolioParts';
import { FeaturedProject } from '@/components/FeaturedProject';
import { BlogCollectionCard } from '@/components/BlogCollectionCard';
import { blogCollections } from '@/content/blog';
import { FluentIcon } from '@/components/FluentIcon';
import { SocialIcon } from '@/components/SocialIcon';
import { homeCta, homeIntro, homeProjects, homePublications, profileSummary, selectedExperience } from '@/content/profile';


export function BioPage() {
  const [name, ...credentials] = profileSummary.name.split(', ');
  const featured = homeProjects.find((project) => project.featured);
  const otherProjects = homeProjects.filter((project) => !project.featured);

  return (
    <div className="portfolio-home">
      <section className="portfolio-hero" aria-labelledby="home-title">
        <div className="portfolio-hero-copy">
          <p className="portfolio-kicker">{profileSummary.location}<span aria-hidden="true"> / </span>{credentials.join(', ')}</p>
          <h1 id="home-title">{name}</h1>
          <p className="portfolio-lede">Cardiovascular researcher.<br /><span>Independent builder.</span></p>
          <p className="portfolio-intro">{homeIntro.description}</p>
          <div className="portfolio-actions">
            <a className="portfolio-button" href="#work">Explore my work <span aria-hidden="true">↓</span></a>
            <a className="portfolio-text-link" href={homeCta.emailHref}>Get in touch <FluentIcon name="arrow" size={14} /></a>
          </div>
        </div>
        <aside className="portfolio-profile" aria-label="Profile and contact">
          <img className="portfolio-portrait" src={profileSummary.avatarSrc} alt="Portrait of Wenhao Liu" width={112} height={112} />
          <p className="portfolio-availability"><span aria-hidden="true" />{homeIntro.kicker}</p>
          <div className="portfolio-profile-role"><p className="portfolio-kicker">Currently</p><p>{profileSummary.role}</p></div>
          <div className="portfolio-profile-links">
            <a className="portfolio-text-link" href={homeCta.cvHref} download>Curriculum Vitae <FluentIcon name="download" size={14} /></a>
            <div className="portfolio-socials" aria-label="Social links">
              {profileSummary.socialLinks.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <SocialIcon name={social.label as 'GitHub' | 'LinkedIn' | 'X' | 'ORCID'} />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section id="work" className="portfolio-section portfolio-work" aria-labelledby="work-title">
        <header className="portfolio-section-heading">
          <div><p className="portfolio-kicker">Independent projects</p><h2 id="work-title">Selected work</h2></div>
          <a className="portfolio-text-link" href="projects.html">All projects <FluentIcon name="arrow" size={14} /></a>
        </header>
        {featured ? <FeaturedProject project={featured} /> : null}
        {otherProjects.length ? <div className="portfolio-projects">
          {otherProjects.map(project => <ProjectCard project={project} key={project.title} />)}
        </div> : null}
      </section>

      <section id="writing" className="portfolio-section" aria-labelledby="writing-title">
        <header className="portfolio-section-heading">
          <div><p className="portfolio-kicker">Blogs</p><h2 id="writing-title">Writing</h2></div>
          <a className="portfolio-text-link" href="blog.html">All writing <FluentIcon name="arrow" size={14} /></a>
        </header>
        <div className="portfolio-blog-collections">
          {blogCollections.map(collection => <BlogCollectionCard collection={collection} compact key={collection.id} />)}
        </div>
      </section>

      <section className="portfolio-section portfolio-background" aria-labelledby="background-title">
        <div className="portfolio-background-intro">
          <p className="portfolio-kicker">Behind the work</p>
          <h2 id="background-title">Cardiovascular research<br /><em>& clinical education.</em></h2>
          <p>I completed my Ph.D. at the University of Tokyo in March 2026 and joined Edwards Lifesciences as a Clinical Education Senior Specialist in TMTT. My research background is in heart failure and RNA metabolism.</p>
          <a className="portfolio-text-link" href="experience.html">Full experience <FluentIcon name="arrow" size={14} /></a>
        </div>
        <div className="portfolio-experience" aria-label="Selected experience">
          {selectedExperience.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.summary}</p></article>)}
        </div>
      </section>

      <section className="portfolio-section" aria-labelledby="research-title">
        <header className="portfolio-section-heading">
          <div><p className="portfolio-kicker">Papers & talks</p><h2 id="research-title">Selected research</h2></div>
          <a className="portfolio-text-link" href="research.html">Research archive <FluentIcon name="arrow" size={14} /></a>
        </header>
        <div className="portfolio-research-list">
          {homePublications.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.summary}</p></article>)}
        </div>
        <details className="portfolio-methods">
          <summary>Methods & working languages<span aria-hidden="true">+</span></summary>
          <div className="portfolio-methods-content">
            <div><h3>Methods</h3><ul className="portfolio-tags">{profileSummary.coreStack.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>
            <div><h3>Languages</h3><ul className="portfolio-tags">{profileSummary.languages.map((language) => <li key={language}>{language}</li>)}</ul></div>
          </div>
        </details>
      </section>

      <section id="contact" className="portfolio-contact" aria-labelledby="contact-title">
        <div><p className="portfolio-kicker">Get in touch</p><h2 id="contact-title">{homeCta.title}.</h2><p>{homeCta.description}</p></div>
        <div className="portfolio-contact-actions">
          <a className="portfolio-button" href={homeCta.emailHref}>Email Wenhao <FluentIcon name="arrow" size={14} /></a>
          <a className="portfolio-text-link" href={homeCta.cvHref} download>Download CV <FluentIcon name="download" size={14} /></a>
        </div>
      </section>
    </div>
  );
}
