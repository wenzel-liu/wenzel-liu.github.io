import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { siteHref } from '@/lib/nav';
import { PrimaryNav } from './PrimaryNav';
import { ThemeControl } from './ThemeControl';

interface SiteShellProps {
  children: ReactNode;
  currentPath?: string;
}

export function SiteShell({ children, currentPath: suppliedPath }: SiteShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const currentPath = suppliedPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/index.html');

  useEffect(() => {
    // React mounts after the browser's first attempt to resolve a URL fragment.
    const frame = window.requestAnimationFrame(() => {
      if (!window.location.hash) return;
      try {
        document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
      } catch {
        // An invalid URL fragment should not prevent the page from loading.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const menu = mobileNavRef.current;
      const toggle = mobileToggleRef.current;

      if (!menu || !toggle) {
        return;
      }

      if (!menu.contains(target) && !toggle.contains(target)) {
        setMobileOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
      }
    };

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 980) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="fds-app-shell fds-app-shell--portfolio">
      <a className="fds-skip-link" href="#main-content">Skip to content</a>

      <header className="fds-topbar">
        <div className="fds-topbar-inner">
          <a className="fds-brand" href={siteHref('index.html')} aria-label="Wenhao Liu homepage">
            <span className="fds-brand-glyph">W</span>
            <span className="fds-brand-copy">
              <strong>Wenhao Liu</strong>
              <span>Research · Education · Technology</span>
            </span>
          </a>

          <PrimaryNav currentPath={currentPath} className="top-nav" ariaLabel="Primary" />

          <div className="fds-topbar-actions">
            <a className="fds-nav-contact" href="mailto:wenzel_liu@outlook.jp">Contact</a>
            <ThemeControl />

            <button
              ref={mobileToggleRef}
              className="fds-iconbtn mobile-toggle"
              type="button"
              aria-controls="mobile-nav"
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <span className="mobile-toggle-label">Menu</span>
            </button>
          </div>
        </div>

        <PrimaryNav
          id="mobile-nav"
          currentPath={currentPath}
          navRef={mobileNavRef}
          className={`mobile-nav${mobileOpen ? ' open' : ''}`}
          ariaLabel="Mobile navigation"
          onNavigate={() => setMobileOpen(false)}
        />
      </header>

      <main className="fds-shell" id="main-content" tabIndex={-1}>{children}</main>

      <footer className="fds-footer">
        <span>© 2026 Wenhao Liu</span>
        <span className="sep">·</span>
        <span>Tokyo, Japan</span>
        <span className="sep">·</span>
        <a href="https://github.com/wenzel-liu/wenzel-liu.github.io" target="_blank" rel="noopener noreferrer">
          View source
        </a>
      </footer>

    </div>
  );
}
