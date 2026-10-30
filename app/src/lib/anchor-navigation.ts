export function samePageAnchor(event: MouseEvent): HTMLElement | null {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return null;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return null;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return null;
  try { return document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return null; }
}

/** Align search destinations after React/static controls and fonts have settled. */
export function initializeAnchorNavigation(): () => void {
  const main = document.getElementById('main-content');
  if (!main) return () => {};
  const originalPadding = main.style.paddingBottom;
  const events = new AbortController();
  let generation = 0;
  let frame = 0;

  function navigate() {
    const current = ++generation;
    const hash = location.hash;
    main!.style.paddingBottom = originalPadding;
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    const align = () => {
      if (current !== generation || location.hash !== hash || !target.isConnected) return;
      if (!target.hasAttribute('data-search-target')) { target.scrollIntoView(); return; }
      main!.style.paddingBottom = originalPadding;
      const header = document.querySelector<HTMLElement>('.fds-topbar');
      const offset = (header?.getBoundingClientRect().height || 0) + 16;
      // A browser may reapply the native fragment scroll after the module runs.
      target.style.scrollMarginTop = `${offset}px`;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
      const available = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      // The final item also needs enough space below it to reach the top of the viewport.
      const extra = Math.max(0, Math.ceil(top - available));
      if (extra) main!.style.paddingBottom = `${parseFloat(getComputedStyle(main!).paddingBottom) + extra}px`;
      target.focus({ preventScroll: true });
      window.scrollTo({ top, behavior: 'instant' });
    };
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(align);
    if (document.fonts?.status === 'loading') {
      void document.fonts.ready.then(() => {
        if (current === generation) frame = requestAnimationFrame(align);
      });
    }
  }
  window.addEventListener('hashchange', navigate, { signal: events.signal });
  document.addEventListener('click', event => {
    const target = samePageAnchor(event);
    try {
      if (target?.id === decodeURIComponent(location.hash.slice(1))) navigate();
    } catch { /* Invalid fragments are ignored. */ }
  }, { signal: events.signal });
  // Do not pull the visitor back if they start interacting before a font finishes loading.
  for (const event of ['wheel', 'touchmove', 'pointerdown', 'keydown']) {
    window.addEventListener(event, () => { generation++; }, { signal: events.signal, passive: true });
  }
  navigate();
  return () => {
    generation++; cancelAnimationFrame(frame); events.abort(); main.style.paddingBottom = originalPadding;
  };
}
